import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../../core/base.types';
import { UserReadService } from '../../user/user-read.service';
import { TwilioBaseService } from '../twilio-base.service';
import { resolveChannel } from './channel-resolver';
import { buildContentVariables, type RenderableContact, renderTemplateBody } from './render-template-body';
import { TwilioMessagingService } from './twilio-messaging.service';
import type { DispatchSendInput, MessagingJobStatusView } from './twilio-messaging.types';

const DISPATCH_CONCURRENCY = 10;
const COUNTER_FLUSH_EVERY = 50;

type PlanRow = {
	contactId: string;
	contact: RenderableContact;
	phoneNumber: string | null;
	hasWhatsApp: boolean;
	channelUsed: 'sms' | 'whatsapp' | null;
	fellBack: boolean;
	skippedReason: 'no_phone' | 'no_channel_available' | null;
	renderedBody: string;
	contentVariables: Record<string, string>;
};

export class MessagingDispatchService extends TwilioBaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly twilioMessaging: TwilioMessagingService,
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

	protected async resolveContactIdsForType(
		input: DispatchSendInput['recipientType'],
		selection: DispatchSendInput['selection'],
		currentUserId: string,
	): Promise<string[]> {
		// Overridden in tests. Wired to real services in services.ts via subclass or injection.
		void input;
		void selection;
		void currentUserId;

		return [];
	}

	async dispatchSend(input: DispatchSendInput, currentUserId: string): Promise<ServiceResult<{ jobId: string }>> {
		const admin = await this.assertAdmin(currentUserId);
		if (!admin.success) {
			return admin;
		}

		const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
		if (!messagingServiceSid) {
			return this.resultFail('Missing TWILIO_MESSAGING_SERVICE_SID');
		}

		const clientResult = this.getTwilioClient();
		if (!clientResult.success) {
			return clientResult;
		}

		const templateResult = await this.twilioMessaging.getContentTemplate(input.templateSid);
		if (!templateResult.success) {
			return this.resultFail(templateResult.error);
		}
		const template = templateResult.data;
		if (!template.body) {
			return this.resultFail('Template has no body');
		}

		const ids = await this.resolveContactIdsForType(input.recipientType, input.selection, currentUserId);
		const contacts = await this.db.contact.findMany({
			where: { id: { in: ids } },
			include: { phone: true },
		});

		const plan: PlanRow[] = contacts.map((c) => {
			const phoneNumber = c.phone?.number ?? null;
			const hasWhatsApp = c.phone?.hasWhatsApp ?? false;
			const resolved = resolveChannel({ requested: input.channel, phoneNumber, hasWhatsApp });
			const renderable: RenderableContact = {
				firstName: c.firstName,
				lastName: c.lastName,
				callingName: c.callingName,
				email: c.email,
				gender: c.gender,
				language: c.language,
				dateOfBirth: c.dateOfBirth,
				profession: c.profession,
			};
			const renderedBody = renderTemplateBody(template.body!, template.variables, input.assignments, renderable);
			const contentVariables = buildContentVariables(template.variables, input.assignments, renderable);

			return {
				contactId: c.id,
				contact: renderable,
				phoneNumber,
				hasWhatsApp,
				channelUsed: resolved.channelUsed,
				fellBack: resolved.fellBack,
				skippedReason: resolved.skippedReason,
				renderedBody,
				contentVariables,
			};
		});

		const skippedCount = plan.filter((p) => p.channelUsed === null).length;
		const fallbackCount = plan.filter((p) => p.fellBack).length;

		const job = await this.db.$transaction(async (tx) => {
			const created = await tx.messagingJob.create({
				data: {
					templateSid: input.templateSid,
					templateFriendlyName: template.friendlyName,
					channelRequested: input.channel,
					recipientType: input.recipientType,
					assignments: input.assignments,
					totalSelected: plan.length,
					sentCount: 0,
					failedCount: 0,
					skippedCount,
					fallbackCount,
					deliveredCount: 0,
					status: 'running',
					createdById: currentUserId,
					startedAt: new Date(),
				},
			});
			await tx.messageLog.createMany({
				data: plan.map((p) => ({
					jobId: created.id,
					contactId: p.contactId,
					phoneNumber: p.phoneNumber,
					channelRequested: input.channel,
					channelUsed: p.channelUsed,
					fellBack: p.fellBack,
					renderedBody: p.renderedBody,
					twilioStatus: p.channelUsed === null ? null : 'queued',
					skippedReason: p.skippedReason,
				})),
			});

			return created;
		});

		try {
			const logs = await this.db.messageLog.findMany({ where: { jobId: job.id } });
			const logByContact = new Map(logs.map((l) => [l.contactId, l]));

			let sentCount = 0;
			let failedCount = 0;
			let sinceFlush = 0;
			const sendable = plan.filter((p) => p.channelUsed !== null);
			const flushCounters = async () => {
				await this.db.messagingJob.update({
					where: { id: job.id },
					data: { sentCount, failedCount },
				});
				sinceFlush = 0;
			};

			const baseUrl = process.env.BASE_URL ?? '';
			const statusCallback = baseUrl.startsWith('https://') ? `${baseUrl}/api/v1/twilio/messaging-status` : undefined;

			const dispatch = async (p: PlanRow): Promise<void> => {
				const log = logByContact.get(p.contactId);
				if (!log || !p.phoneNumber || !p.channelUsed) {
					return;
				}
				const to = p.channelUsed === 'whatsapp' ? `whatsapp:${p.phoneNumber}` : p.phoneNumber;
				try {
					const msg = await clientResult.data.messages.create({
						messagingServiceSid,
						contentSid: input.templateSid,
						contentVariables: JSON.stringify(p.contentVariables),
						to,
						...(statusCallback ? { statusCallback } : {}),
					});
					await this.db.messageLog.update({
						where: { id: log.id },
						data: { twilioMessageSid: msg.sid, twilioStatus: 'queued' },
					});
					sentCount += 1;
				} catch (error) {
					const errAny = error as { code?: number | string; message?: string };
					try {
						await this.db.messageLog.update({
							where: { id: log.id },
							data: {
								twilioStatus: 'failed',
								twilioErrorCode: errAny.code != null ? String(errAny.code) : null,
								twilioErrorMessage: errAny.message ?? String(error),
							},
						});
					} catch (dbError) {
						this.logger.error(dbError);
					}
					failedCount += 1;
					this.logger.error(error);
				}
				sinceFlush += 1;
				if (sinceFlush >= COUNTER_FLUSH_EVERY) {
					await flushCounters();
				}
			};

			for (let i = 0; i < sendable.length; i += DISPATCH_CONCURRENCY) {
				const chunk = sendable.slice(i, i + DISPATCH_CONCURRENCY);
				await Promise.all(chunk.map(dispatch));
			}

			await this.db.messagingJob.update({
				where: { id: job.id },
				data: {
					sentCount,
					failedCount,
					skippedCount,
					fallbackCount,
					status: 'completed',
					finishedAt: new Date(),
				},
			});

			return this.resultOk({ jobId: job.id });
		} catch (error) {
			this.logger.error(error);
			await this.db.messagingJob
				.update({
					where: { id: job.id },
					data: { status: 'interrupted', finishedAt: new Date() },
				})
				.catch((markError) => {
					this.logger.error(markError);
				});

			return this.resultFail('Dispatch failed unexpectedly');
		}
	}

	async getJobStatus(jobId: string, currentUserId: string): Promise<ServiceResult<MessagingJobStatusView>> {
		const admin = await this.assertAdmin(currentUserId);
		if (!admin.success) {
			return admin;
		}

		const job = await this.db.messagingJob.findUnique({ where: { id: jobId } });
		if (!job) {
			return this.resultFail('Job not found');
		}

		const channelGroups = await this.db.messageLog.groupBy({
			by: ['channelUsed'],
			where: { jobId, channelUsed: { not: null } },
			_count: { _all: true },
		});
		const perChannel = { sms: 0, whatsapp: 0 };
		for (const g of channelGroups) {
			if (g.channelUsed === 'sms') {
				perChannel.sms = g._count._all;
			}
			if (g.channelUsed === 'whatsapp') {
				perChannel.whatsapp = g._count._all;
			}
		}

		return this.resultOk({
			id: job.id,
			status: job.status,
			totalSelected: job.totalSelected,
			sentCount: job.sentCount,
			failedCount: job.failedCount,
			skippedCount: job.skippedCount,
			fallbackCount: job.fallbackCount,
			deliveredCount: job.deliveredCount,
			startedAt: job.startedAt,
			finishedAt: job.finishedAt,
			perChannel,
		});
	}
}
