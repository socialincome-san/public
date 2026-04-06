import { PrismaClient } from '@/generated/prisma/client';
import { MessageChannel } from '@/generated/prisma/enums';
import { logger } from '@/lib/utils/logger';
import sgMail from '@sendgrid/mail';
import { BaseService } from '../../core/base.service';
import { ServiceResult } from '../../core/base.types';
import { MessageProvider, SendMessageRequest, SendMessageResponse } from './message-provider';

export class SendGridEmailProvider extends BaseService implements MessageProvider {
	readonly channel = MessageChannel.email;

	private initialized = false;

	private readonly sendGridApiKey = process.env.SENDGRID_API_KEY;
	private readonly sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async send(request: SendMessageRequest): Promise<ServiceResult<SendMessageResponse>> {
		const initResult = this.initialize();
		if (!initResult.success) {
			return initResult;
		}

		try {
			const [response] = await sgMail.send({
				to: request.to,
				from: this.sendGridFromEmail!,
				subject: request.subject ?? '',
				text: request.body,
			});

			const externalId = response.headers['x-message-id'] as string | undefined;

			this.logger.info('SendGrid email sent successfully', { externalId, to: request.to });

			return this.resultOk({ externalId: externalId ?? '' });
		} catch (error) {
			this.logger.error('Failed to send SendGrid email', { error, to: request.to });

			return this.resultFail(
				`Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private initialize(): ServiceResult<void> {
		if (this.initialized) {
			return this.resultOk(undefined);
		}

		const envCheck = this.requireEnvVars();
		if (!envCheck.success) {
			return envCheck;
		}

		sgMail.setApiKey(this.sendGridApiKey!);
		this.initialized = true;

		return this.resultOk(undefined);
	}

	private requireEnvVars(): ServiceResult<void> {
		if (!this.sendGridApiKey || !this.sendGridFromEmail) {
			return this.resultFail('Missing SendGrid environment variables (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)');
		}

		return this.resultOk(undefined);
	}
}
