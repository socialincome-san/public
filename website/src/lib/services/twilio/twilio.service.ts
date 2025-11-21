import { UserRecord } from 'firebase-admin/auth';
import { Twilio } from 'twilio';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseService } from '../firebase/firebase.service';
import { VerifyOtpRequest, VerifyOtpResult } from './twilio.types';
export class TwilioService extends BaseService {
	private readonly firebaseService = new FirebaseService();
	private readonly twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
	private readonly TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

	async verifyOtp(request: VerifyOtpRequest): Promise<ServiceResult<VerifyOtpResult>> {
		let { phoneNumber, otp } = request;

		// Validate environment variables
		if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !this.TWILIO_VERIFY_SERVICE_SID) {
			return this.resultFail('Missing Twilio environment variables');
		}

		// Validate inputs
		if (!phoneNumber || !otp) {
			this.logger.info('Missing phone number or OTP');
			return this.resultFail('Phone number and OTP are required');
		}

		// Format phone number to E.164 format if not already
		if (!phoneNumber.startsWith('+')) {
			phoneNumber = `+${phoneNumber}`;
		}

		// Basic E.164 validation (should start with + followed by digits only)
		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		if (!phoneRegex.test(phoneNumber)) {
			this.logger.info('Invalid phone number format');
			return this.resultFail('Phone number must be in valid E.164 format (e.g., +12345678901)');
		}

		// Verify OTP with Twilio
		try {
			if (process.env.TWILIO_DEV_MODE === 'true') {
				this.logger.info('🚧 DEVELOPMENT MODE: Skipping Twilio verification');
			} else {
				this.logger.info('Attempting to verify OTP for phone');
				const verification = await this.twilioClient.verify.v2
					.services(this.TWILIO_VERIFY_SERVICE_SID)
					.verificationChecks.create({
						to: phoneNumber,
						code: otp,
					});

				this.logger.info(
					`Twilio verification response has status: '${verification.status}' and sid '${verification.sid}'`,
				);

				// Check if verification was successful
				if (verification.status !== 'approved') {
					this.logger.info('OTP verification failed', { status: verification.status });
					return this.resultFail('Invalid OTP provided');
				}
			}
		} catch (error: unknown) {
			// Check for Twilio's error code directly from the error object
			if ((error as any)?.code === 20404) {
				// Specific error code for "Verification not found". See https://www.twilio.com/docs/errors/20404
				return this.resultFail('Verification resource not found for the provided phone number and OTP');
			}

			this.logger.error(error);
			return this.resultFail('Failed to verify OTP');
		}

		// OTP is valid, create or get Firebase user
		try {
			this.logger.info('OTP verified successfully, checking if user exists');
			let isNewUser = false;

			// Check if user with given phoneNumber exists
			let userRecord: UserRecord | null = null;
			try {
				userRecord = await this.getUserByPhoneNumber(phoneNumber);
			} catch (error: unknown) {
				if ((error as any)?.code === 'auth/user-not-found') {
					this.logger.info('User not found with given phone number');
				} else {
					this.logger.error(error);
					return this.resultFail('Failed to check existing user');
				}
			}

			// If user does not exist, create a new Firebase Auth user
			if (userRecord == null) {
				this.logger.info('Creating new user with given phone number');
				isNewUser = true;
				const createResult = await this.createUserWithPhoneNumber(phoneNumber);
				if (!createResult) {
					return this.resultFail('Could not create user with given phone number');
				}
				userRecord = createResult;
			}

			// If user exists, generate custom auth token
			const customToken = await this.generateCustomToken(userRecord);
			if (!customToken) {
				return this.resultFail('Could not create auth token for user');
			}

			// Return the custom token and user information
			return this.resultOk({
				customToken,
				isNewUser,
				uid: userRecord.uid,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Failed to generate custom token');
		}
	}

	private async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord | null> {
		const result = await this.firebaseService.getByPhoneNumber(phoneNumber);
		if (!result.success) {
			this.logger.info('User not found with given phone number', { phoneNumber, error: result.error });
			return null;
		}
		return result.data;
	}

	private async createUserWithPhoneNumber(phoneNumber: string): Promise<UserRecord | null> {
		const result = await this.firebaseService.createByPhoneNumber(phoneNumber);
		if (!result.success) {
			this.logger.error(result.error);
			return null;
		}
		this.logger.info('New user created successfully', { userId: result.data.uid });
		return result.data;
	}

	private async generateCustomToken(userRecord: UserRecord): Promise<string | null> {
		const result = await this.firebaseService.createCustomToken(userRecord.uid);
		if (!result.success) {
			this.logger.error(result.error);
			return null;
		}
		this.logger.info('Custom token created for user', { userId: userRecord.uid });
		return result.data;
	}
}
