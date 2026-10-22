import { resultFail, resultOk, type Result } from '@/lib/result';
import sgMail from '@sendgrid/mail';

type SendgridTemplate = {
	id: string;
	data: Record<string, unknown>;
};

export type SendgridMailInput = {
	to: string | string[];
	from: string;
	subject: string;
	text: string;
	template?: SendgridTemplate;
	sensitive?: boolean;
};

export const sendSendgridEmail = async (input: SendgridMailInput): Promise<Result<void>> => {
	const apiKey = process.env.SENDGRID_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('SendGrid is not configured');
	}

	try {
		sgMail.setApiKey(apiKey);
		await sgMail.send(
			input.template
				? {
						to: input.to,
						from: input.from,
						templateId: input.template.id,
						dynamicTemplateData: input.template.data,
					}
				: {
						to: input.to,
						from: input.from,
						subject: input.subject,
						text: input.text,
					},
		);

		return resultOk(undefined);
	} catch (error) {
		if (input.sensitive) {
			console.error('Could not send sensitive SendGrid email');
		} else {
			console.error('Could not send SendGrid email', { error });
		}

		return resultFail('Could not send email');
	}
};
