import sgMail from '@sendgrid/mail';
import { ServiceResult } from '../core/base.types';

type SendEmailInput = {
	to: string | string[];
	subject: string;
	text: string;
};

export class SendgridMailService {
	private initialized = false;

	async send(input: SendEmailInput): Promise<ServiceResult<void>> {
		try {
			const apiKey = process.env.SENDGRID_API_KEY;
			const from = process.env.SENDGRID_FROM_EMAIL;

			if (!apiKey || !from) {
				return {
					success: false,
					error: 'Missing required SendGrid environment variables',
				};
			}

			if (!this.initialized) {
				sgMail.setApiKey(apiKey);
				this.initialized = true;
			}

			await sgMail.send({
				to: input.to,
				from,
				subject: input.subject,
				text: input.text,
			});

			return { success: true, data: undefined };
		} catch (error) {
			return {
				success: false,
				error: `Unable to send email: ${String(error)}`,
			};
		}
	}
}
