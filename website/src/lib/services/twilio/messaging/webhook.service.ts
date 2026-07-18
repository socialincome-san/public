import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';

export class MessagingWebhookService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async handleStatusCallback(input: {
		messageSid: string;
		status: string;
		errorCode?: string | null;
		errorMessage?: string | null;
	}): Promise<ServiceResult<{ updated: boolean }>> {
		const existing = await this.db.messageLog.findUnique({ where: { twilioMessageSid: input.messageSid } });
		if (!existing) {
			this.logger.warn(`Status callback for unknown messageSid ${input.messageSid}`);

			return this.resultOk({ updated: false });
		}

		const becameDelivered = input.status === 'delivered' && existing.twilioStatus !== 'delivered';

		await this.db.messageLog.update({
			where: { id: existing.id },
			data: {
				twilioStatus: input.status,
				twilioErrorCode: input.errorCode ?? existing.twilioErrorCode,
				twilioErrorMessage: input.errorMessage ?? existing.twilioErrorMessage,
			},
		});

		if (becameDelivered) {
			await this.db.messagingJob.update({
				where: { id: existing.jobId },
				data: { deliveredCount: { increment: 1 } },
			});
		}

		return this.resultOk({ updated: true });
	}
}
