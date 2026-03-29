import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { MessageProvider, SendMessageRequest, SendMessageResponse } from './message-provider';

export class TwilioWhatsAppProvider extends BaseService implements MessageProvider {
	readonly channel = MessageChannel.whatsapp;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async send(_request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>> {
		// TODO: Implement Twilio WhatsApp sending
		return this.resultFail('Twilio WhatsApp provider not implemented');
	}
}
