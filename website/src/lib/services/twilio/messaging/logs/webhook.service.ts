import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../../../core/base.service';
import { ServiceResult } from '../../../core/base.types';

// Terminal positive delivery states, ordered latest-last. A row in one of these must never be
// regressed by a duplicate or out-of-order Twilio callback.
const DELIVERED_STATUSES = ['delivered', 'read'] as const;

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

		const data = {
			twilioStatus: input.status,
			twilioErrorCode: input.errorCode ?? existing.twilioErrorCode,
			twilioErrorMessage: input.errorMessage ?? existing.twilioErrorMessage,
		};

		if (input.status === 'delivered') {
			// Flip to delivered only from a pre-delivery state, atomically, and increment the job counter
			// in the same transaction. Twilio can deliver duplicate or out-of-order callbacks, so the
			// row-level condition — not the value we read above — decides whether this callback caused the
			// transition. Guarding against `read` too keeps a late duplicate `delivered` from regressing a
			// `read` row or double-counting. count === 1 guarantees the increment happens exactly once.
			const updated = await this.db.$transaction(async (tx) => {
				const flipped = await tx.messageLog.updateMany({
					where: { id: existing.id, twilioStatus: { notIn: [...DELIVERED_STATUSES] } },
					data,
				});
				if (flipped.count === 1) {
					await tx.messagingJob.update({
						where: { id: existing.jobId },
						data: { deliveredCount: { increment: 1 } },
					});
				}

				return flipped.count === 1;
			});

			return this.resultOk({ updated });
		}

		// Never let a late, out-of-order callback regress a terminal delivery state: once a row is
		// `delivered`/`read`, only a forward move to `read` may still apply.
		const blockedFrom = input.status === 'read' ? ['read'] : [...DELIVERED_STATUSES];
		const result = await this.db.messageLog.updateMany({
			where: { id: existing.id, twilioStatus: { notIn: blockedFrom } },
			data,
		});

		return this.resultOk({ updated: result.count === 1 });
	}
}
