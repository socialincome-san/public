import { MessagingJob, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { ServiceResult } from '../../../core/base.types';
import { UserReadService } from '../../../user/user-read.service';
import { TwilioBaseService } from '../../twilio-base.service';
import { MessagingRecipientsService } from '../recipients/recipients.service';
import { buildContentVariables, type RenderableContact, renderTemplateBody } from '../twilio-templates/render-template-body';
import { TwilioTemplateService } from '../twilio-templates/twilio-template.service';
import { resolveChannel } from './channel-resolver';
import type { DispatchSendInput, MessagingJobStatusView } from './dispatch.types';

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
		private readonly twilioTemplateService: TwilioTemplateService,
		private readonly recipientsService: MessagingRecipientsService,
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

	protected resolveContactIdsForType(
		recipientType: DispatchSendInput['recipientType'],
		selection: DispatchSendInput['selection'],
		currentUserId: string,
	): Promise<string[]> {
		return this.recipientsService.resolveContactIds(recipientType, selection, currentUserId);
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

		const templateResult = await this.twilioTemplateService.getTwilioTemplate(input.templateSid);
		if (!templateResult.success) {
			return this.resultFail(templateResult.error);
		}
		const template = templateResult.data;
		if (!template.body) {
			return this.resultFail('Template has no body');
		}

		// Recipient resolution, contact loading, template rendering and job creation can all throw.
		// These run before any job row exists, so a failure here is returned as a ServiceResult rather
		// than being allowed to reject the action (which would leave the caller's review step hanging).
		let job: MessagingJob;
		let plan: PlanRow[];
		let skippedCount: number;
		let fallbackCount: number;
		try {
			const ids = await this.resolveContactIdsForType(input.recipientType, input.selection, currentUserId);
			const contacts = await this.db.contact.findMany({
				where: { id: { in: ids } },
				include: { phone: true },
			});

			plan = contacts.map((c) => {
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

			skippedCount = plan.filter((p) => p.channelUsed === null).length;
			fallbackCount = plan.filter((p) => p.fellBack).length;

			job = await this.db.$transaction(async (tx) => {
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
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Failed to prepare messaging job');
		}

		try {
			const logs = await this.db.messageLog.findMany({ where: { jobId: job.id } });
			const logByContact = new Map(logs.map((l) => [l.contactId, l]));

			let sentCount = 0;
			let failedCount = 0;
			let sinceFlush = 0;
			const sendable = plan.filter((p) => p.channelUsed !== null);
			// A counter flush is a progress optimization only — never let it abort a send in flight.
			const flushCounters = async () => {
				sinceFlush = 0;
				try {
					await this.db.messagingJob.update({
						where: { id: job.id },
						data: { sentCount, failedCount },
					});
				} catch (error) {
					this.logger.error(error);
				}
			};

			const baseUrl = process.env.BASE_URL ?? '';
			const statusCallback = baseUrl.startsWith('https://') ? `${baseUrl}/api/v1/twilio/messaging/status` : undefined;

			const dispatch = async (p: PlanRow): Promise<void> => {
				const log = logByContact.get(p.contactId);
				if (!log || !p.phoneNumber || !p.channelUsed) {
					return;
				}
				const to = p.channelUsed === 'whatsapp' ? `whatsapp:${p.phoneNumber}` : p.phoneNumber;

				let msgSid: string;
				try {
					const msg = await clientResult.data.messages.create({
						messagingServiceSid,
						contentSid: input.templateSid,
						contentVariables: JSON.stringify(p.contentVariables),
						to,
						...(statusCallback ? { statusCallback } : {}),
					});
					msgSid = msg.sid;
				} catch (error) {
					// The send itself failed — this row genuinely did not go out, so mark it failed.
					const errAny = error as { code?: number | string; message?: string };
					try {
						await this.db.messageLog.update({
							where: { id: log.id },
							data: {
								twilioStatus: 'failed',
								twilioErrorCode: errAny.code !== undefined ? String(errAny.code) : null,
								twilioErrorMessage: errAny.message ?? String(error),
							},
						});
					} catch (dbError) {
						this.logger.error(dbError);
					}
					failedCount += 1;
					this.logger.error(error);
					sinceFlush += 1;
					if (sinceFlush >= COUNTER_FLUSH_EVERY) {
						await flushCounters();
					}

					return;
				}

				// Twilio accepted the message. Persisting the SID is best-effort: if it fails the message
				// is still sent, so it must NOT be marked failed. The row stays `queued` and the status
				// webhook / manual sync reconciles it later; count it as sent either way.
				sentCount += 1;
				try {
					await this.db.messageLog.update({
						where: { id: log.id },
						data: { twilioMessageSid: msgSid, twilioStatus: 'queued' },
					});
				} catch (dbError) {
					this.logger.error(dbError);
				}
				sinceFlush += 1;
				if (sinceFlush >= COUNTER_FLUSH_EVERY) {
					await flushCounters();
				}
			};

			// allSettled so one unexpected worker rejection can't abandon its siblings mid-batch;
			// dispatch already handles its own errors, so a rejection here is truly exceptional.
			for (let i = 0; i < sendable.length; i += DISPATCH_CONCURRENCY) {
				const chunk = sendable.slice(i, i + DISPATCH_CONCURRENCY);
				const settled = await Promise.allSettled(chunk.map(dispatch));
				for (const outcome of settled) {
					if (outcome.status === 'rejected') {
						this.logger.error(outcome.reason);
					}
				}
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
