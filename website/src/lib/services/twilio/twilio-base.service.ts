import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { Twilio } from 'twilio';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export abstract class TwilioBaseService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	private twilioClient?: Twilio;

	protected readonly twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
	protected readonly twilioApiKeySid = process.env.TWILIO_API_KEY_SID;
	protected readonly twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;

	protected formatError(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}

	protected requireTwilioBaseEnvVars(): ServiceResult<void> {
		if (!this.twilioAccountSid || !this.twilioApiKeySid || !this.twilioApiKeySecret) {
			return this.resultFail('Missing Twilio environment variables');
		}

		if (!this.twilioAccountSid.startsWith('AC')) {
			return this.resultFail('Invalid TWILIO_ACCOUNT_SID format');
		}

		if (!this.twilioApiKeySid.startsWith('SK')) {
			return this.resultFail('Invalid TWILIO_API_KEY_SID format');
		}

		return this.resultOk(undefined);
	}

	protected getTwilioClient(): ServiceResult<Twilio> {
		if (this.twilioClient) {
			return this.resultOk(this.twilioClient);
		}

		const envCheck = this.requireTwilioBaseEnvVars();
		if (!envCheck.success) {
			return envCheck;
		}

		try {
			this.twilioClient = new Twilio(this.twilioApiKeySid, this.twilioApiKeySecret, {
				accountSid: this.twilioAccountSid,
			});

			return this.resultOk(this.twilioClient);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Failed to initialize Twilio client');
		}
	}
}
