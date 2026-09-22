import { sendSendgridEmail } from '@/integrations/sendgrid/sendgrid-mail.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isAdmin } from '@/modules/users/user.service';
import * as mailRepository from './mail.repository';
import type { SendMailInput, SentEmailPaginatedTableView, SentEmailTableQuery, SentEmailTableViewRow } from './mail.types';

export const sendMail = async (input: SendMailInput): Promise<ServiceResult<void>> => {
	try {
		const from = process.env.SENDGRID_FROM_EMAIL?.trim();
		if (!process.env.SENDGRID_API_KEY?.trim() || !from) {
			return resultFail('Missing required SendGrid environment variables');
		}

		const sendResult = await sendSendgridEmail({
			to: input.to,
			from,
			subject: input.subject,
			text: input.text,
		});
		if (!sendResult.success) {
			return resultFail(sendResult.error);
		}

		await storeSentEmails(input, from);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not send email', { error });

		return resultFail('Could not send email');
	}
};

export const getPaginatedSentEmailTableView = async (
	userId: string,
	query: SentEmailTableQuery,
): Promise<ServiceResult<SentEmailPaginatedTableView>> => {
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

const storeSentEmails = async (input: SendMailInput, from: string) => {
	const recipients = Array.isArray(input.to) ? input.to : [input.to];

	await Promise.all(
		recipients.map(async (toEmail) => {
			const contact = await mailRepository.findContactIdByEmail(toEmail);

			return mailRepository.createSentEmail({
				toEmail,
				fromEmail: from,
				subject: input.subject,
				body: input.text,
				contactId: contact?.id ?? null,
			});
		}),
	);
};
