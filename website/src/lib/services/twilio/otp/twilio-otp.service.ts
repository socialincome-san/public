import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { UserRecord } from 'firebase-admin/auth';
import { AppReviewModeService } from '../../app-review-mode/app-review-mode.service';
import { ServiceResult } from '../../core/base.types';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';
import { TwilioBaseService } from '../twilio-base.service';
import { VerifyOtpRequest, VerifyOtpResult } from './twilio-otp.types';

export class TwilioOtpService extends TwilioBaseService {
	constructor(
		db: PrismaClient,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly appReviewModeService: AppReviewModeService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private readonly twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

	async requestOtp(phoneNumber: string): Promise<ServiceResult<boolean>> {
		try {
			const envCheck = this.requireOtpEnvVars();
			if (!envCheck.success) {
				return envCheck;
			}

			const phoneResult = this.requireValidPhoneNumber(phoneNumber);
			if (!phoneResult.success) {
				return phoneResult;
			}

			const bypassResult = this.appReviewModeService.shouldBypass(phoneResult.data);
			if (!bypassResult.success) {
				return this.resultFail(bypassResult.error);
			}
			if (bypassResult.data) {
				this.logger.info('APP REVIEW MODE: Skipping Twilio OTP send for app review phone');

				return this.resultOk(true);
			}

			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			this.logger.info('Twilio: Requesting OTP for phone');
			await twilioClientResult.data.verify.v2.services(this.twilioVerifyServiceSid ?? '').verifications.create({
				to: phoneResult.data,
				channel: 'sms',
			});

			return this.resultOk(true);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to request OTP: ${JSON.stringify(error)}`);
		}
	}

	async verifyOtp(request: VerifyOtpRequest): Promise<ServiceResult<VerifyOtpResult>> {
		try {
			const envCheck = this.requireOtpEnvVars();
			if (!envCheck.success) {
				return envCheck;
			}

			if (!request.phoneNumber || !request.otp) {
				this.logger.info('Missing phone number or OTP');

				return this.resultFail('Phone number and OTP are required');
			}

			const phoneResult = this.requireValidPhoneNumber(request.phoneNumber);
			if (!phoneResult.success) {
				return phoneResult;
			}

			const bypassResult = this.appReviewModeService.shouldBypass(phoneResult.data);
			if (!bypassResult.success) {
				return this.resultFail(bypassResult.error);
			}
			if (bypassResult.data) {
				this.logger.info('APP REVIEW MODE: Skipping Twilio verify for app review phone');

				return await this.finalizeOtpVerification(phoneResult.data);
			}

			const twilioClientResult = this.getTwilioClient();
			if (!twilioClientResult.success) {
				return twilioClientResult;
			}

			this.logger.info('Twilio: Attempting to verify OTP for phone');
			const verification = await twilioClientResult.data.verify.v2
				.services(this.twilioVerifyServiceSid ?? '')
				.verificationChecks.create({
					to: phoneResult.data,
					code: request.otp,
				});

			this.logger.info(`Twilio verification response has status: '${verification.status}' and sid '${verification.sid}'`);

			if (verification.status !== 'approved') {
				this.logger.info('OTP verification failed', { status: verification.status });

				return this.resultFail('Invalid OTP provided');
			}

			return await this.finalizeOtpVerification(phoneResult.data);
		} catch (error: unknown) {
			if ((error as { code?: number })?.code === 20404) {
				return this.resultFail('Verification resource not found for the provided phone number and OTP');
			}

			this.logger.error(error);

			return this.resultFail(`Failed to verify OTP: ${JSON.stringify(error)}`);
		}
	}

	private async finalizeOtpVerification(phoneNumber: string): Promise<ServiceResult<VerifyOtpResult>> {
		try {
			this.logger.info('OTP verified successfully, checking if user exists');
			let isNewUser = false;

			let userRecord = await this.getUserByPhoneNumber(phoneNumber);
			if (!userRecord) {
				this.logger.info('Creating new user with given phone number');
				isNewUser = true;
				userRecord = await this.createUserWithPhoneNumber(phoneNumber);
				if (!userRecord) {
					return this.resultFail('Could not create user with given phone number');
				}
			}

			const customToken = await this.generateCustomToken(userRecord);
			if (!customToken) {
				return this.resultFail('Could not create auth token for user');
			}

			return this.resultOk({
				customToken,
				isNewUser,
				uid: userRecord.uid,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to generate custom token: ${JSON.stringify(error)}`);
		}
	}

	private requireOtpEnvVars(): ServiceResult<void> {
		const baseCheck = this.requireTwilioBaseEnvVars();
		if (!baseCheck.success) {
			return baseCheck;
		}

		if (!this.twilioVerifyServiceSid) {
			return this.resultFail('Missing TWILIO_VERIFY_SERVICE_SID');
		}

		if (!this.twilioVerifyServiceSid.startsWith('VA')) {
			return this.resultFail('Invalid TWILIO_VERIFY_SERVICE_SID format');
		}

		return this.resultOk(undefined);
	}

	private requireValidPhoneNumber(phoneNumber?: string): ServiceResult<string> {
		if (!phoneNumber) {
			this.logger.info('Missing phone number');

			return this.resultFail('Phone number is required');
		}

		let normalized = phoneNumber;
		if (!normalized.startsWith('+')) {
			normalized = `+${normalized}`;
		}

		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		if (!phoneRegex.test(normalized)) {
			this.logger.info('Invalid phone number format');

			return this.resultFail('Phone number must be in valid E.164 format (e.g., +12345678901)');
		}

		return this.resultOk(normalized);
	}

	private async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord | null> {
		const result = await this.firebaseAdminService.getByPhoneNumber(phoneNumber);
		if (!result.success) {
			this.logger.info('User not found with given phone number', { phoneNumber, error: result.error });

			return null;
		}

		return result.data;
	}

	private async createUserWithPhoneNumber(phoneNumber: string): Promise<UserRecord | null> {
		const result = await this.firebaseAdminService.createByPhoneNumber(phoneNumber);
		if (!result.success) {
			this.logger.error(result.error);

			return null;
		}
		this.logger.info('New user created successfully', { userId: result.data.uid });

		return result.data;
	}

	private async generateCustomToken(userRecord: UserRecord): Promise<string | null> {
		const result = await this.firebaseAdminService.createCustomToken(userRecord.uid);
		if (!result.success) {
			this.logger.error(result.error);

			return null;
		}
		this.logger.info('Custom token created for user', { userId: userRecord.uid });

		return result.data;
	}
}
