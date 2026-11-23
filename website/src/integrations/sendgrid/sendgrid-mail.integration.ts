import { resultFail, resultOk, type Result } from '@/lib/result';
import sgMail from '@sendgrid/mail';

type SendgridTemplate = {
	id: string;
	data: Record<string, unknown>;
};

export type SendgridMailInput = {
	to: string;
	from: string;
	subject: string;
	text: string;
	template?: SendgridTemplate;
	categories: string[];
	customArgs: Record<string, string>;
};

export const sendSendgridEmail = async (input: SendgridMailInput): Promise<Result<{ messageId: string | null }>> => {
	const apiKey = process.env.SENDGRID_API_KEY?.trim();
	if (!apiKey) {
		return resultFail('SendGrid is not configured');
	}

	try {
		sgMail.setApiKey(apiKey);
		const tracking = { categories: input.categories, customArgs: input.customArgs };
		const [response] = await sgMail.send(
			input.template
				? {
						to: input.to,
						from: input.from,
						templateId: input.template.id,
						dynamicTemplateData: input.template.data,
						...tracking,
					}
				: {
						to: input.to,
						from: input.from,
						subject: input.subject,
						text: input.text,
						...tracking,
					},
		);

		return resultOk({ messageId: readMessageId(response?.headers) });
	} catch (error) {
		console.error('Could not send SendGrid email', { error });

		return resultFail('Could not send email');
	}
};

const readMessageId = (headers: unknown): string | null => {
	if (typeof headers !== 'object' || headers === null || !('x-message-id' in headers)) {
		return null;
	}

	return typeof headers['x-message-id'] === 'string' ? headers['x-message-id'] : null;
};
