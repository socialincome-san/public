import { PrismaClient } from '@/generated/prisma/client';
import sgMail from '@sendgrid/mail';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

type SendEmailInput = {
	to: string | string[];
	subject: string;
	text: string;
};

export class SendgridMailService extends BaseService {
	private initialized = false;

	constructor(db: PrismaClient) {
		super(db);
	}

	async send(input: SendEmailInput): Promise<ServiceResult<void>> {
		try {
			const from = process.env.SENDGRID_FROM_EMAIL;

			if (!process.env.SENDGRID_API_KEY || !from) {
				return {
					success: false,
					error: 'Missing required SendGrid environment variables',
				};
			}

			await this.sendEmail(input, from);
			await this.storeSentEmails(input, from);

			return { success: true, data: undefined };
		} catch (error) {
			return {
				success: false,
				error: `Unable to send email: ${String(error)}`,
			};
		}
	}

	private async sendEmail(input: SendEmailInput, from: string): Promise<void> {
		const apiKey = process.env.SENDGRID_API_KEY;

		if (!this.initialized && apiKey) {
			sgMail.setApiKey(apiKey);
			this.initialized = true;
		}

		await sgMail.send({
			to: input.to,
			from,
			subject: input.subject,
			text: input.text,
		});
	}

	private async storeSentEmails(input: SendEmailInput, from: string): Promise<void> {
		const recipients = Array.isArray(input.to) ? input.to : [input.to];

		await Promise.all(
			recipients.map(async (toEmail) => {
				const contact = await this.db.contact.findUnique({ where: { email: toEmail } });

				return this.db.sentEmail.create({
					data: {
						toEmail,
						fromEmail: from,
						subject: input.subject,
						body: input.text,
						contactId: contact?.id,
					},
				});
			}),
		);
	}
}
