import { SentEmailStatus } from '@/generated/prisma/enums';
import {
	verifySendgridEventWebhook,
	type SendgridEventWebhookInput,
} from '@/integrations/sendgrid/sendgrid-events.integration';
import { sendSendgridEmail } from '@/integrations/sendgrid/sendgrid-mail.integration';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { isAdmin } from '@/modules/users/user.service';
import * as mailRepository from './mail.repository';
import { sendgridEventsSchema, type SendgridEvent } from './mail.schemas';
import {
	notificationTypes,
	sentEmailStatusRank,
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

		const recipients = readRecipients(notificationTypes[input.type].recipientsEnv);
		if (recipients.length === 0) {
			console.warn('Notification recipients not set', { type: input.type });

			return resultFail('Notification recipients not set');
		}

		const outcomes = await Promise.all(recipients.map((toEmail) => deliver(input, from, toEmail)));
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

		let updated = 0;
		for (const event of parsed.data) {
			const status = toSentEmailStatus(event);
			if (!status || !event.sent_email_id) {
				continue;
			}

			const result = await mailRepository.updateSentEmailStatusIfIn(event.sent_email_id, lowerStatuses(status), {
				status,
				errorMessage: event.reason ?? event.response ?? null,
				statusUpdatedAt: new Date(event.timestamp * 1000),
			});
			updated += result.count;
		}

		return resultOk({ updated });
	} catch (error) {
		console.error('Could not apply SendGrid events', { error });

		return resultFail('Could not apply SendGrid events');
	}
};

export const getPaginatedSentEmailTableView = async (
	userId: string,
	query: SentEmailTableQuery,
): Promise<Result<SentEmailPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { sentEmails, totalCount } = await mailRepository.findPaginatedSentEmails(query);
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

const readRecipients = (envName: string) =>
	(process.env[envName] ?? '')
		.split(',')
		.map((recipient) => recipient.trim())
		.filter(Boolean);

const deliver = async (
	input: SendNotificationInput,
	from: string,
	toEmail: string,
): Promise<'sent' | 'skipped' | 'failed'> => {
	const idempotencyKey = input.idempotencyKey ? `${input.idempotencyKey}:${toEmail}` : null;
	const existing = idempotencyKey ? await mailRepository.findSentEmailByIdempotencyKey(idempotencyKey) : null;
	if (existing && existing.status !== 'failed') {
		return 'skipped';
	}

	let sentEmailId = existing?.id;
	if (!sentEmailId) {
		const contact = await mailRepository.findContactIdByEmail(toEmail);
		const created = await mailRepository.createSentEmail({
			toEmail,
			fromEmail: from,
			subject: input.subject,
			body: input.text,
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
		subject: input.subject,
		text: input.text,
		template: input.template,
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

	await mailRepository.updateSentEmail(sentEmailId, {
		status: 'sent',
		providerMessageId: sendResult.data.messageId,
		errorMessage: null,
		sentAt: now,
		statusUpdatedAt: now,
	});

	return 'sent';
};

const sendgridEventStatuses: Record<string, SentEmailStatus> = {
	deferred: 'deferred',
	delivered: 'delivered',
	open: 'opened',
	bounce: 'bounced',
	dropped: 'dropped',
	spamreport: 'spam_reported',
};

const toSentEmailStatus = (event: SendgridEvent): SentEmailStatus | null => sendgridEventStatuses[event.event] ?? null;

const lowerStatuses = (status: SentEmailStatus) =>
	Object.values(SentEmailStatus).filter((candidate) => sentEmailStatusRank[candidate] < sentEmailStatusRank[status]);
