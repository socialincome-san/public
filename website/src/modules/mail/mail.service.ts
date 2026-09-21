import { sendSendgridEmail } from '@/integrations/sendgrid/sendgrid-mail.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import * as mailRepository from './mail.repository';
import type { SendMailInput } from './mail.types';

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
