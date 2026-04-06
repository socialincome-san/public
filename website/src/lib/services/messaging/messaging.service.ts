import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel, MessageRecipientType, MessageStatus } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { MessageTemplateReadService } from './message-template-read.service';
import { MessageTemplateValidationService } from './message-template-validation.service';
import { MessageBatchResult, ResolvedRecipient, SendMessageInput, SendToContactsInput } from './messaging.types';
import { MessageProviderRegistry } from './providers/message-provider-registry';

export class MessagingService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly providerRegistry: MessageProviderRegistry,
		private readonly templateReadService: MessageTemplateReadService,
		private readonly templateValidationService: MessageTemplateValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async sendMessages(userId: string, input: SendMessageInput): Promise<ServiceResult<MessageBatchResult>> {
		if (!input.templateId && !input.freeTextBody) {
			return this.resultFail('Either a template or free text body must be provided.');
		}
		if (input.templateId && input.freeTextBody) {
			return this.resultFail('Provide either a template or free text, not both.');
		}
		if (input.recipientIds.length === 0) {
			return this.resultFail('At least one recipient must be selected.');
		}

		const provider = this.providerRegistry.get(input.channel);
		if (!provider) {
			return this.resultFail(`No provider available for channel: ${input.channel}`);
		}

		let templateBody: string | undefined;
		let templateSubject: string | null | undefined;
		let templateId: string | undefined;

		if (input.templateId) {
			const templateResult = await this.templateReadService.getById(input.templateId);
			if (!templateResult.success) {
				return this.resultFail(templateResult.error);
			}
			templateBody = templateResult.data.body;
			templateSubject = templateResult.data.subject;
			templateId = templateResult.data.id;
		}

		const resolvedResult = await this.resolveRecipients(input.recipientType, input.recipientIds, input.channel);
		if (!resolvedResult.success) {
			return this.resultFail(resolvedResult.error);
		}

		const resolved = resolvedResult.data;
		const result: MessageBatchResult = {
			totalRequested: input.recipientIds.length,
			sent: 0,
			failed: 0,
			errors: [],
		};

		for (const recipient of resolved) {
			const body = templateBody ? this.renderTemplate(templateBody, recipient.templateContext) : (input.freeTextBody ?? '');
			const subject = templateBody
				? templateSubject
					? this.renderTemplate(templateSubject, recipient.templateContext)
					: undefined
				: input.freeTextSubject;

			const sendResult = await provider.send({
				to: recipient.addressee,
				body,
				subject: subject ?? undefined,
			});

			const status: MessageStatus = sendResult.success ? MessageStatus.sent : MessageStatus.failed;

			try {
				await this.db.message.create({
					data: {
						channel: input.channel,
						subject: subject ?? null,
						body,
						recipientType: input.recipientType,
						recipientId: recipient.entityId,
						addressee: recipient.addressee,
						status,
						externalId: sendResult.success ? sendResult.data.externalId : null,
						errorMessage: sendResult.success ? null : sendResult.error,
						sentAt: sendResult.success ? new Date() : null,
						sentByUserId: userId,
						templateId: templateId ?? null,
					},
				});
			} catch (dbError) {
				this.logger.error('Failed to log message', { entityId: recipient.entityId, error: dbError });
			}

			if (sendResult.success) {
				result.sent++;
			} else {
				result.failed++;
				result.errors.push({ entityId: recipient.entityId, error: sendResult.error });
			}
		}

		return this.resultOk(result);
	}

	async sendToContacts(userId: string, input: SendToContactsInput): Promise<ServiceResult<MessageBatchResult>> {
		if (!input.templateId && !input.freeTextBody) {
			return this.resultFail('Either a template or free text body must be provided.');
		}
		if (input.templateId && input.freeTextBody) {
			return this.resultFail('Provide either a template or free text, not both.');
		}
		if (input.contacts.length === 0) {
			return this.resultFail('At least one contact must be provided.');
		}

		const provider = this.providerRegistry.get(input.channel);
		if (!provider) {
			return this.resultFail(`No provider available for channel: ${input.channel}`);
		}

		let templateBody: string | undefined;
		let templateSubject: string | null | undefined;
		let templateId: string | undefined;

		if (input.templateId) {
			const templateResult = await this.templateReadService.getById(input.templateId);
			if (!templateResult.success) {
				return this.resultFail(templateResult.error);
			}
			templateBody = templateResult.data.body;
			templateSubject = templateResult.data.subject;
			templateId = templateResult.data.id;
		}

		const result: MessageBatchResult = {
			totalRequested: input.contacts.length,
			sent: 0,
			failed: 0,
			errors: [],
		};

		for (const contact of input.contacts) {
			const body = templateBody ? this.renderTemplate(templateBody, {}) : (input.freeTextBody ?? '');
			const subject = templateBody
				? templateSubject
					? this.renderTemplate(templateSubject, {})
					: undefined
				: input.freeTextSubject;

			const sendResult = await provider.send({
				to: contact,
				body,
				subject: subject ?? undefined,
			});

			const status: MessageStatus = sendResult.success ? MessageStatus.sent : MessageStatus.failed;

			try {
				await this.db.message.create({
					data: {
						channel: input.channel,
						subject: subject ?? null,
						body,
						recipientType: null,
						recipientId: null,
						addressee: contact,
						status,
						externalId: sendResult.success ? sendResult.data.externalId : null,
						errorMessage: sendResult.success ? null : sendResult.error,
						sentAt: sendResult.success ? new Date() : null,
						sentByUserId: userId,
						templateId: templateId ?? null,
					},
				});
			} catch (dbError) {
				this.logger.error('Failed to log message', { contact, error: dbError });
			}

			if (sendResult.success) {
				result.sent++;
			} else {
				result.failed++;
				result.errors.push({ entityId: contact, error: sendResult.error });
			}
		}

		return this.resultOk(result);
	}

	private async resolveRecipients(
		recipientType: MessageRecipientType,
		recipientIds: string[],
		channel: MessageChannel,
	): Promise<ServiceResult<ResolvedRecipient[]>> {
		try {
			const resolved: ResolvedRecipient[] = [];

			switch (recipientType) {
				case MessageRecipientType.recipient: {
					const recipients = await this.db.recipient.findMany({
						where: { id: { in: recipientIds } },
						select: {
							id: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									callingName: true,
									email: true,
									phone: { select: { number: true } },
								},
							},
							program: { select: { name: true } },
							localPartner: { select: { name: true } },
						},
					});
					for (const r of recipients) {
						const addressee = this.resolveAddressForChannel(channel, r.contact.phone?.number, r.contact.email);
						if (!addressee) {
							continue;
						}
						resolved.push({
							entityId: r.id,
							addressee,
							templateContext: {
								'contact.firstName': r.contact.firstName,
								'contact.lastName': r.contact.lastName,
								'contact.callingName': r.contact.callingName ?? '',
								'contact.email': r.contact.email ?? '',
								'contact.phone': r.contact.phone?.number ?? '',
								'recipient.programName': r.program?.name ?? '',
								'recipient.localPartnerName': r.localPartner?.name ?? '',
							},
						});
					}
					break;
				}
				case MessageRecipientType.contributor: {
					const contributors = await this.db.contributor.findMany({
						where: { id: { in: recipientIds } },
						select: {
							id: true,
							paymentReferenceId: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									callingName: true,
									email: true,
									phone: { select: { number: true } },
								},
							},
						},
					});
					for (const c of contributors) {
						const addressee = this.resolveAddressForChannel(channel, c.contact.phone?.number, c.contact.email);
						if (!addressee) {
							continue;
						}
						resolved.push({
							entityId: c.id,
							addressee,
							templateContext: {
								'contact.firstName': c.contact.firstName,
								'contact.lastName': c.contact.lastName,
								'contact.callingName': c.contact.callingName ?? '',
								'contact.email': c.contact.email ?? '',
								'contact.phone': c.contact.phone?.number ?? '',
								'contributor.paymentReferenceId': c.paymentReferenceId ?? '',
							},
						});
					}
					break;
				}
				case MessageRecipientType.local_partner: {
					const partners = await this.db.localPartner.findMany({
						where: { id: { in: recipientIds } },
						select: {
							id: true,
							name: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									callingName: true,
									email: true,
									phone: { select: { number: true } },
								},
							},
						},
					});
					for (const p of partners) {
						const addressee = this.resolveAddressForChannel(channel, p.contact.phone?.number, p.contact.email);
						if (!addressee) {
							continue;
						}
						resolved.push({
							entityId: p.id,
							addressee,
							templateContext: {
								'contact.firstName': p.contact.firstName,
								'contact.lastName': p.contact.lastName,
								'contact.callingName': p.contact.callingName ?? '',
								'contact.email': p.contact.email ?? '',
								'contact.phone': p.contact.phone?.number ?? '',
							},
						});
					}
					break;
				}
				case MessageRecipientType.user: {
					const users = await this.db.user.findMany({
						where: { id: { in: recipientIds } },
						select: {
							id: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									callingName: true,
									email: true,
									phone: { select: { number: true } },
								},
							},
						},
					});
					for (const u of users) {
						const addressee = this.resolveAddressForChannel(channel, u.contact.phone?.number, u.contact.email);
						if (!addressee) {
							continue;
						}
						resolved.push({
							entityId: u.id,
							addressee,
							templateContext: {
								'contact.firstName': u.contact.firstName,
								'contact.lastName': u.contact.lastName,
								'contact.callingName': u.contact.callingName ?? '',
								'contact.email': u.contact.email ?? '',
								'contact.phone': u.contact.phone?.number ?? '',
							},
						});
					}
					break;
				}
			}

			return this.resultOk(resolved);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not resolve recipients: ${JSON.stringify(error)}`);
		}
	}

	private resolveAddressForChannel(
		channel: MessageChannel,
		phone: string | undefined | null,
		email: string | undefined | null,
	): string | null {
		switch (channel) {
			case MessageChannel.sms:
			case MessageChannel.whatsapp:
				return phone ?? null;
			case MessageChannel.email:
				return email ?? null;
		}
	}

	private renderTemplate(template: string, context: Record<string, string>): string {
		return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key: string) => {
			return context[key] ?? match;
		});
	}
}
