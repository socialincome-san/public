import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { UserReadService } from '../../user/user-read.service';
import type { MessagingJobDetailView, MessagingJobListRow } from './twilio-messaging.types';

export class MessagingLogService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
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
}
