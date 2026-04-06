import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { Twilio } from 'twilio';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { MessageProvider, SendMessageRequest, SendMessageResponse } from './message-provider';

export class TwilioWhatsAppProvider extends BaseService implements MessageProvider {
	readonly channel = MessageChannel.whatsapp;

	private twilioClient?: Twilio;

	private readonly twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
	private readonly twilioApiKeySid = process.env.TWILIO_API_KEY_SID;
	private readonly twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;
	private readonly twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async send(request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>> {
		try {
			const clientResult = this.getTwilioClient();
			if (!clientResult.success) {
				return clientResult;
			}

			const message = await clientResult.data.messages.create({
				to: `whatsapp:${request.to}`,
				body: request.body,
				from: `whatsapp:${this.twilioPhoneNumber}`,
			});

			this.logger.info('Twilio WhatsApp sent successfully', { sid: message.sid, to: request.to });

			return this.resultOk({ externalId: message.sid });
		} catch (error) {
			this.logger.error('Failed to send Twilio WhatsApp', { error, to: request.to });

			return this.resultFail(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private getTwilioClient(): ServiceResult<Twilio> {
		if (this.twilioClient) {
			return this.resultOk(this.twilioClient);
		}

		const envCheck = this.requireTwilioEnvVars();
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

	private requireTwilioEnvVars(): ServiceResult<void> {
		if (!this.twilioAccountSid || !this.twilioApiKeySid || !this.twilioApiKeySecret || !this.twilioPhoneNumber) {
			return this.resultFail('Missing Twilio environment variables for WhatsApp provider');
		}

		if (!this.twilioAccountSid.startsWith('AC')) {
			return this.resultFail('Invalid TWILIO_ACCOUNT_SID format');
		}

		if (!this.twilioApiKeySid.startsWith('SK')) {
			return this.resultFail('Invalid TWILIO_API_KEY_SID format');
		}

		return this.resultOk(undefined);
	}
}
