import { UserRecord } from 'firebase-admin/auth';
import { Twilio } from 'twilio';
import { PrismaClient } from '@/generated/prisma/client';
import { AppReviewModeService } from '../app-review-mode/app-review-mode.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { VerifyOtpRequest, VerifyOtpResult } from './twilio.types';

export class TwilioService extends BaseService {
	private readonly firebaseAdminService: FirebaseAdminService;
	private readonly appReviewModeService: AppReviewModeService;

	constructor(db: PrismaClient, firebaseAdminService: FirebaseAdminService, appReviewModeService: AppReviewModeService) {
		super(db);
		this.firebaseAdminService = firebaseAdminService;
		this.appReviewModeService = appReviewModeService;
	}

	private readonly twilioClient = new Twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, {
		accountSid: process.env.TWILIO_ACCOUNT_SID,
	});

	private readonly TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

	async requestOtp(phoneNumber: string): Promise<ServiceResult<boolean>> {
		const envCheck = this.requireTwilioEnvVars();
		if (!envCheck.success) {
			return envCheck;
		}

		const phoneResult = this.requireValidPhoneNumber(phoneNumber);
		if (!phoneResult.success) {
			return phoneResult;
		}

		if (this.appReviewModeService.shouldBypass(phoneResult.data)) {
			this.logger.info('APP REVIEW MODE: Skipping Twilio OTP send for app review phone');
			return this.resultOk(true);
		}

		try {
			this.logger.info('Twilio: Requesting OTP for phone');
			await this.twilioClient.verify.v2.services(this.TWILIO_VERIFY_SERVICE_SID ?? '').verifications.create({
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
		const envCheck = this.requireTwilioEnvVars();
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

		if (this.appReviewModeService.shouldBypass(phoneResult.data)) {
			this.logger.info('APP REVIEW MODE: Skipping Twilio verify for app review phone');
			return await this.finalizeOtpVerification(phoneResult.data);
		}

		try {
			this.logger.info('Twilio: Attempting to verify OTP for phone');
			const verification = await this.twilioClient.verify.v2
				.services(this.TWILIO_VERIFY_SERVICE_SID ?? '')
				.verificationChecks.create({
					to: phoneResult.data,
					code: request.otp,
				});

			this.logger.info(
				`Twilio verification response has status: '${verification.status}' and sid '${verification.sid}'`,
			);

			if (verification.status !== 'approved') {
				this.logger.info('OTP verification failed', { status: verification.status });
				throw new Error('invalid-otp');
			}
		} catch (error: any) {
			if (error?.code === 20404) {
				return this.resultFail('Verification resource not found for the provided phone number and OTP');
			}
			if (error?.message === 'invalid-otp') {
				return this.resultFail('Invalid OTP provided');
			}

			this.logger.error(error);
			return this.resultFail(`Failed to verify OTP: ${JSON.stringify(error)}`);
		}

		return await this.finalizeOtpVerification(phoneResult.data);
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

	private requireTwilioEnvVars(): ServiceResult<void> {
		if (
			!process.env.TWILIO_ACCOUNT_SID ||
			!process.env.TWILIO_API_KEY_SID ||
			!process.env.TWILIO_API_KEY_SECRET ||
			!this.TWILIO_VERIFY_SERVICE_SID
		) {
			return this.resultFail('Missing Twilio environment variables');
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
