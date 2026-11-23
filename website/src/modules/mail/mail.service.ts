import { SentEmailStatus } from '@/generated/prisma/enums';
import { listSendgridAutomations, type SendgridAutomation } from '@/integrations/sendgrid/sendgrid-automations.integration';
import {
	verifySendgridEventWebhook,
	type SendgridEventWebhookInput,
} from '@/integrations/sendgrid/sendgrid-events.integration';
import { sendSendgridEmail } from '@/integrations/sendgrid/sendgrid-mail.integration';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { isAdmin } from '@/modules/users/user.service';
import { renderNotification } from './mail-templates.service';
import * as mailRepository from './mail.repository';
import { sendgridEventsSchema, type SendgridEvent } from './mail.schemas';
import {
	notificationTypes,
	otherEmails,
	sentEmailStatusRank,
	type EmailAutomationView,
	type EmailCatalogDetail,
	type EmailCatalogEntry,
	type EmailPreview,
	type NotificationContent,
	type NotificationType,
	type RenderedEmail,
	type SendNotificationInput,
	type SendNotificationResult,
	type SentEmailPaginatedTableView,
	type SentEmailTableQuery,
	type SentEmailTableViewRow,
} from './mail.types';

export const sendNotification = async (input: SendNotificationInput): Promise<Result<SendNotificationResult>> => {
	try {
		const from = process.env.SENDGRID_FROM_EMAIL?.trim();
		if (!process.env.SENDGRID_API_KEY?.trim() || !from) {
			return resultFail('Missing required SendGrid environment variables');
		}

		const recipients = getNotificationReceivers(input.type);
		if (recipients.length === 0) {
			console.warn('Notification recipients not set', { type: input.type });

			return resultFail('Notification recipients not set');
		}

		const renderResult = renderNotification(input);
		if (!renderResult.success) {
			return resultFail(renderResult.error);
		}

		const outcomes = await Promise.all(recipients.map((toEmail) => deliver(input, renderResult.data, from, toEmail)));
		if (outcomes.includes('failed')) {
			return resultFail('Could not send notification');
		}

		return resultOk({
			sent: outcomes.filter((outcome) => outcome === 'sent').length,
			skipped: outcomes.filter((outcome) => outcome === 'skipped').length,
		});
	} catch (error) {
		console.error('Could not send notification', { type: input.type, error });

		return resultFail('Could not send notification');
	}
};

export const handleSendgridEvents = async (input: SendgridEventWebhookInput): Promise<Result<{ updated: number }>> => {
	const verifyResult = verifySendgridEventWebhook(input);
	if (!verifyResult.success) {
		return resultFail(verifyResult.error);
	}
	if (!verifyResult.data) {
		return resultFail('Invalid SendGrid signature', 403);
	}

	try {
		const parsed = sendgridEventsSchema.safeParse(JSON.parse(input.rawBody));
		if (!parsed.success) {
			return resultFail('Invalid SendGrid event payload', 400);
		}

		const counts = await Promise.all(
			parsed.data.map(async (event) => {
				const status = toSentEmailStatus(event);
				if (!status || !event.sent_email_id) {
					return 0;
				}

				const result = await mailRepository.updateSentEmailStatusIfIn(event.sent_email_id, lowerStatuses(status), {
					status,
					errorMessage: event.reason ?? event.response ?? null,
					statusUpdatedAt: new Date(event.timestamp * 1000),
				});

				return result.count;
			}),
		);
		const updated = counts.reduce((sum, count) => sum + count, 0);

		return resultOk({ updated });
	} catch (error) {
		console.error('Could not apply SendGrid events', { error });

		return resultFail('Could not apply SendGrid events');
	}
};

export const getPaginatedSentEmailTableView = async (
	userId: string,
	query: SentEmailTableQuery,
	type?: string,
): Promise<Result<SentEmailPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { sentEmails, totalCount } = await mailRepository.findPaginatedSentEmails(query, type);
		const tableRows: SentEmailTableViewRow[] = sentEmails.map((sentEmail) => ({
			id: sentEmail.id,
			sentAt: sentEmail.sentAt,
			toEmail: sentEmail.toEmail,
			subject: sentEmail.subject,
			body: sentEmail.body,
			fromEmail: sentEmail.fromEmail,
			type: sentEmail.type ?? '',
			status: sentEmail.status,
			errorMessage: sentEmail.errorMessage ?? '',
			contact: sentEmail.contact
				? [sentEmail.contact.firstName, sentEmail.contact.lastName, sentEmail.contact.email].filter(Boolean).join(' ')
				: '',
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch sent emails', { userId, error });

		return resultFail('Could not fetch sent emails');
	}
};

export const getEmailCatalog = async (userId: string): Promise<Result<EmailCatalogEntry[]>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		return resultOk(await buildCatalog());
	} catch (error) {
		console.error('Could not build email catalog', { userId, error });

		return resultFail('Could not load emails');
	}
};

export const getEmailCatalogDetail = async (userId: string, key: string): Promise<Result<EmailCatalogDetail>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const entry = (await buildCatalog()).find((candidate) => candidate.key === key);
		if (!entry) {
			return resultFail('Email not found', 404);
		}

		if (isNotificationType(key)) {
			const receivers = getNotificationReceivers(key);
			const renderResult = renderNotification(notificationSamples[key]);

			return resultOk({
				...entry,
				receivers,
				preview: renderResult.success ? toPreview(renderResult.data, receivers) : null,
				previewError: renderResult.success ? null : renderResult.error,
				automations: [],
				automationsError: null,
			});
		}

		const automationNames = otherEmails.find((email) => email.key === key)?.sendgridAutomations ?? [];
		const automationsResult = automationNames.length > 0 ? await listSendgridAutomations(automationNames) : null;

		return resultOk({
			...entry,
			receivers: [],
			preview: null,
			previewError: null,
			automations: automationsResult?.success ? automationsResult.data.map(toAutomationView) : [],
			automationsError: automationsResult && !automationsResult.success ? automationsResult.error : null,
		});
	} catch (error) {
		console.error('Could not load email', { userId, key, error });

		return resultFail('Could not load email');
	}
};

const getNotificationReceivers = (type: NotificationType): string[] =>
	(process.env[notificationTypes[type].recipientsEnv] ?? '')
		.split(',')
		.map((recipient) => recipient.trim())
		.filter(Boolean);

const deliver = async (
	input: SendNotificationInput,
	email: RenderedEmail,
	from: string,
	toEmail: string,
): Promise<'sent' | 'skipped' | 'failed'> => {
	const idempotencyKey = input.idempotencyKey ? `${input.idempotencyKey}:${toEmail}` : null;
	const existing = idempotencyKey ? await mailRepository.findSentEmailByIdempotencyKey(idempotencyKey) : null;
	if (existing && !isRetryable(existing)) {
		return 'skipped';
	}

	let sentEmailId = existing?.id;
	if (!sentEmailId) {
		const contact = await mailRepository.findContactIdByEmail(toEmail);
		const created = await mailRepository.createSentEmail({
			toEmail,
			fromEmail: from,
			subject: email.subject,
			body: email.text,
			contactId: contact?.id ?? null,
			type: input.type,
			status: 'queued',
			idempotencyKey,
			campaignId: input.campaignId ?? null,
		});
		if (created.kind === 'duplicate') {
			return 'skipped';
		}
		sentEmailId = created.id;
	}

	const sendResult = await sendSendgridEmail({
		to: toEmail,
		from,
		subject: email.subject,
		text: email.text,
		template: email.template,
		categories: [notificationTypes[input.type].category, input.type],
		customArgs: { sent_email_id: sentEmailId },
	});
	const now = new Date();
	if (!sendResult.success) {
		await mailRepository.updateSentEmail(sentEmailId, {
			status: 'failed',
			errorMessage: sendResult.error,
			statusUpdatedAt: now,
		});

		return 'failed';
	}

	await mailRepository.updateSentEmail(sentEmailId, { providerMessageId: sendResult.data.messageId, sentAt: now });
	// A webhook event may already have moved the status past sent.
	await mailRepository.updateSentEmailStatusIfIn(sentEmailId, ['queued', 'failed'], {
		status: 'sent',
		errorMessage: null,
		statusUpdatedAt: now,
	});

	return 'sent';
};

// A row stays queued when the process died between logging and sending;
// after a while it no longer blocks a retry.
const staleQueuedMs = 15 * 60 * 1000;

const isRetryable = (sentEmail: { status: SentEmailStatus; createdAt: Date; updatedAt: Date | null }) =>
	sentEmail.status === 'failed' ||
	(sentEmail.status === 'queued' && Date.now() - (sentEmail.updatedAt ?? sentEmail.createdAt).getTime() > staleQueuedMs);

const problemStatuses: SentEmailStatus[] = ['failed', 'bounced', 'dropped', 'spam_reported'];
const problemWindowDays = 30;

const buildCatalog = async (): Promise<EmailCatalogEntry[]> => {
	const problemsSince = new Date(Date.now() - problemWindowDays * 24 * 60 * 60 * 1000);
	const { totals, problems } = await mailRepository.groupSentEmailCountsByType(problemStatuses, problemsSince);

	const live = Object.entries(notificationTypes).map(([key, definition]) => {
		const total = totals.find((row) => row.type === key);

		return {
			key,
			name: definition.name,
			description: definition.description,
			trigger: definition.trigger,
			audience: definition.audience,
			category: definition.category,
			languages: [...definition.languages],
			status: 'live' as const,
			source: 'Code',
			sentCount: total?._count._all ?? 0,
			problemCount30Days: problems.find((row) => row.type === key)?._count._all ?? 0,
			lastSentAt: total?._max.sentAt ?? null,
		};
	});
	const other = otherEmails.map((email) => ({
		...email,
		sentCount: 0,
		problemCount30Days: 0,
		lastSentAt: null,
	}));

	return [...live, ...other];
};

const isNotificationType = (key: string): key is NotificationType => Object.hasOwn(notificationTypes, key);

const toPreview = (email: RenderedEmail, receivers: string[]): EmailPreview => ({
	from: process.env.SENDGRID_FROM_EMAIL?.trim() ?? '',
	to: receivers.join(', '),
	subject: email.subject,
	body: email.text,
	sendgridTemplateId: email.template?.id ?? null,
});

const toAutomationView = (automation: SendgridAutomation): EmailAutomationView => ({
	name: automation.name,
	status: automation.status,
	steps: automation.steps.map((step) => ({ delay: formatDelay(step.sendTiming), subject: step.subject })),
});

const formatDelay = (duration: string) => {
	const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:\d+S)?)?$/.exec(duration);
	if (!match) {
		return duration;
	}
	const [days, hours, minutes] = match.slice(1).map((part) => Number(part ?? 0));
	const parts = [
		days ? `${days} ${days === 1 ? 'day' : 'days'}` : '',
		hours ? `${hours} h` : '',
		minutes ? `${minutes} min` : '',
	].filter(Boolean);

	return parts.length === 0 ? 'Immediately' : `${parts.join(' ')} after the previous email`;
};

const sampleCampaign = {
	id: 'sample-campaign',
	slug: 'run-for-sierra-leone',
	title: 'Run for Sierra Leone',
	storyId: 123456,
};

const sampleStats = {
	recipients: { active: 120, former: 8, suspended: 2, future: 15 },
	candidates: 40,
	payouts: { total: 118, confirmed: 110, contested: 2, failed: 1 },
};

// Shown as previews in the portal; every type needs one.
const notificationSamples: { [Type in NotificationType]: Extract<NotificationContent, { type: Type }> } = {
	'monthly-summary': {
		type: 'monthly-summary',
		data: {
			period: { from: new Date('2026-10-01T00:00:00.000Z'), to: new Date('2026-11-01T00:00:00.000Z') },
			moneyIn: { amountChf: 42300, count: 128 },
			moneyOut: { amountChf: 31800, count: 96 },
			new: { contributors: 14, campaigns: 2, programs: 1, recipients: 8 },
			stats: {
				overall: sampleStats,
				countries: { SL: sampleStats },
				localPartners: [{ name: 'Sample Partner', countryIsoCodes: ['SL'], programs: 2, stats: sampleStats }],
			},
		},
	},
	'campaign-created': {
		type: 'campaign-created',
		data: {
			...sampleCampaign,
			creatorName: 'Alex Creator',
			goal: 5000,
			currency: 'CHF',
			endDate: new Date('2027-03-31T00:00:00.000Z'),
			public: true,
			hasAccount: false,
		},
	},
	'campaign-edited': {
		type: 'campaign-edited',
		data: {
			...sampleCampaign,
			editorName: 'Alex Creator',
			changedFields: ['title', 'description', 'goal'],
			hadUnpublishedChanges: false,
		},
	},
};

const sendgridEventStatuses: Record<string, SentEmailStatus> = {
	deferred: 'deferred',
	delivered: 'delivered',
	open: 'opened',
	bounce: 'bounced',
	dropped: 'dropped',
	spamreport: 'spam_reported',
};

const toSentEmailStatus = (event: SendgridEvent): SentEmailStatus | null =>
	Object.hasOwn(sendgridEventStatuses, event.event) ? sendgridEventStatuses[event.event] : null;

const lowerStatuses = (status: SentEmailStatus) =>
	Object.values(SentEmailStatus).filter((candidate) => sentEmailStatusRank[candidate] < sentEmailStatusRank[status]);
