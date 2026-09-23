import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import sgMail from '@sendgrid/mail';

export type SendgridMailInput = {
	to: string | string[];
	from: string;
	subject: string;
	text: string;
};

export const sendSendgridEmail = async (input: SendgridMailInput): Promise<ServiceResult<void>> => {
	const apiKey = process.env.SENDGRID_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('SendGrid is not configured');
	}

	try {
		sgMail.setApiKey(apiKey);
		await sgMail.send({
			to: input.to,
			from: input.from,
			subject: input.subject,
			text: input.text,
		});

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not send SendGrid email', { error });

		return resultFail('Could not send email');
	}
};
