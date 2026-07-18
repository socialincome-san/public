import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../../../core/base.types';
import { UserReadService } from '../../../user/user-read.service';
import { TwilioBaseService } from '../../twilio-base.service';
import type { MessagingJobDetailView, MessagingJobListRow } from './log.types';
import { MessagingWebhookService } from './webhook.service';

// A messaging job left in `running` for longer than this lost its dispatch process (e.g. a crash or
// serverless timeout) and is swept to `interrupted` the next time the log is viewed.
const INTERRUPTED_AFTER_MS = 10 * 60 * 1000;

// How many Twilio message-status lookups to run at once when syncing a job. Mirrors DISPATCH_CONCURRENCY.
const STATUS_SYNC_CONCURRENCY = 10;

// Statuses Twilio never moves out of, so there is nothing to sync for these rows.
const TERMINAL_STATUSES = ['delivered', 'failed', 'undelivered'];

export class MessagingLogService extends TwilioBaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly webhookService: MessagingWebhookService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async markOrphanedJobs(): Promise<void> {
		try {
			const cutoff = new Date(Date.now() - INTERRUPTED_AFTER_MS);
			const result = await this.db.messagingJob.updateMany({
				where: { status: 'running', updatedAt: { lt: cutoff } },
				data: { status: 'interrupted', finishedAt: new Date() },
			});
			if (result.count > 0) {
				this.logger.warn(`Marked ${result.count} orphaned messaging jobs as interrupted`);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	private async assertAdmin(userId: string): Promise<ServiceResult<true>> {
		const result = await this.userService.isAdmin(userId);
		if (!result.success) {
			return this.resultFail(result.error);
		}

		return this.resultOk(true);
	}

	private formatCreatedByName(createdBy: { contact: { firstName: string; lastName: string } | null } | null): string {
		if (!createdBy?.contact) {
			return 'Unknown';
		}
		const name = `${createdBy.contact.firstName} ${createdBy.contact.lastName}`.trim();

		return name === '' ? 'Unknown' : name;
	}

	async listJobs(
		query: { page: number; pageSize: number },
		currentUserId: string,
	): Promise<ServiceResult<{ rows: MessagingJobListRow[]; totalCount: number }>> {
		const admin = await this.assertAdmin(currentUserId);
		if (!admin.success) {
			return admin;
		}

		await this.markOrphanedJobs();

		const skip = (query.page - 1) * query.pageSize;
		const [jobs, totalCount] = await Promise.all([
			this.db.messagingJob.findMany({
				orderBy: { startedAt: 'desc' },
				skip,
				take: query.pageSize,
				include: { createdBy: { select: { contact: { select: { firstName: true, lastName: true } } } } },
			}),
			this.db.messagingJob.count(),
		]);

		const rows: MessagingJobListRow[] = jobs.map((j) => ({
			id: j.id,
			templateFriendlyName: j.templateFriendlyName,
			channelRequested: j.channelRequested,
			sentCount: j.sentCount,
			totalSelected: j.totalSelected,
			status: j.status,
			startedAt: j.startedAt,
			createdByName: this.formatCreatedByName(j.createdBy),
		}));

		return this.resultOk({ rows, totalCount });
	}

	async getJobWithMessages(
		jobId: string,
		query: { page: number; pageSize: number },
		currentUserId: string,
	): Promise<ServiceResult<MessagingJobDetailView>> {
		const admin = await this.assertAdmin(currentUserId);
		if (!admin.success) {
			return admin;
		}

		const job = await this.db.messagingJob.findUnique({
			where: { id: jobId },
			include: { createdBy: { select: { contact: { select: { firstName: true, lastName: true } } } } },
		});
		if (!job) {
			return this.resultFail('Job not found');
		}

		const skip = (query.page - 1) * query.pageSize;
		const [messages, totalCount] = await Promise.all([
			this.db.messageLog.findMany({
				where: { jobId },
				orderBy: { createdAt: 'asc' },
				skip,
				take: query.pageSize,
				include: { contact: { select: { firstName: true, lastName: true } } },
			}),
			this.db.messageLog.count({ where: { jobId } }),
		]);

		const view: MessagingJobDetailView = {
			job: {
				id: job.id,
				templateSid: job.templateSid,
				templateFriendlyName: job.templateFriendlyName,
				channelRequested: job.channelRequested,
				recipientType: job.recipientType,
				status: job.status,
				totalSelected: job.totalSelected,
				sentCount: job.sentCount,
				failedCount: job.failedCount,
				skippedCount: job.skippedCount,
				fallbackCount: job.fallbackCount,
				deliveredCount: job.deliveredCount,
				startedAt: job.startedAt,
				finishedAt: job.finishedAt,
				createdByName: this.formatCreatedByName(job.createdBy),
			},
			messages: {
				rows: messages.map((m) => ({
					id: m.id,
					contactName: `${m.contact.firstName} ${m.contact.lastName}`.trim() || 'Unknown',
					phoneNumber: m.phoneNumber,
					channelUsed: m.channelUsed,
					fellBack: m.fellBack,
					twilioMessageSid: m.twilioMessageSid,
					twilioStatus: m.twilioStatus,
					twilioErrorCode: m.twilioErrorCode,
					twilioErrorMessage: m.twilioErrorMessage,
					skippedReason: m.skippedReason,
					createdAt: m.createdAt,
				})),
				totalCount,
				page: query.page,
				pageSize: query.pageSize,
			},
		};

		return this.resultOk(view);
	}

	// Pulls each recipient's current status from the Twilio API and applies it through the same
	// path the webhook uses. Unlike the webhook, this is an *outbound* call, so it works even where
	// Twilio cannot reach us for callbacks (local dev) and recovers dropped callbacks in production.
	async syncJobStatuses(jobId: string, currentUserId: string): Promise<ServiceResult<{ checked: number; updated: number }>> {
		const admin = await this.assertAdmin(currentUserId);
		if (!admin.success) {
			return admin;
		}

		const clientResult = this.getTwilioClient();
		if (!clientResult.success) {
			return clientResult;
		}
		const client = clientResult.data;

		// Only rows still in a non-terminal state need a lookup; this bounds the number of Twilio API calls.
		const rows = await this.db.messageLog.findMany({
			where: { jobId, twilioMessageSid: { not: null }, twilioStatus: { notIn: TERMINAL_STATUSES } },
			select: { twilioMessageSid: true },
		});
		const sids = rows.map((r) => r.twilioMessageSid).filter((sid): sid is string => sid !== null);

		let updated = 0;
		const syncRow = async (sid: string): Promise<void> => {
			try {
				const msg = await client.messages(sid).fetch();
				const result = await this.webhookService.handleStatusCallback({
					messageSid: sid,
					status: msg.status,
					errorCode: msg.errorCode !== null && msg.errorCode !== undefined ? String(msg.errorCode) : null,
					errorMessage: msg.errorMessage ?? null,
				});
				if (result.success && result.data.updated) {
					updated += 1;
				}
			} catch (error) {
				// A single unreachable SID must not abort the whole sync.
				this.logger.error(error);
			}
		};

		for (let i = 0; i < sids.length; i += STATUS_SYNC_CONCURRENCY) {
			const chunk = sids.slice(i, i + STATUS_SYNC_CONCURRENCY);
			await Promise.all(chunk.map(syncRow));
		}

		return this.resultOk({ checked: sids.length, updated });
	}
}
