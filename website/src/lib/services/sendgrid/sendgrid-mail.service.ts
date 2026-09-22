import { PrismaClient } from '@/generated/prisma/client';
import sgMail from '@sendgrid/mail';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import type { MonthlySummary } from '../monthly-summary/monthly-summary.service';

export const MONTHLY_SUMMARY_TEMPLATE = 'monthlySummary' as const;

type MonthlySummaryCountryTemplateData = {
	name: string;
	recipientsActive: number;
	recipientsFormer: number;
	recipientsSuspended: number;
	recipientsFuture: number;
	candidates: number;
	payoutsTotal: number;
	payoutsConfirmed: number;
	payoutsContested: number;
	payoutsFailed: number;
};

type MonthlySummaryLocalPartnerTemplateData = {
	name: string;
	country: string;
	recipientsActive: number;
	recipientsFormer: number;
	recipientsSuspended: number;
	recipientsFuture: number;
	programs: number;
};

export type MonthlySummaryTemplateData = {
	month: string;
	moneyInAmount: string;
	moneyInCount: number;
	moneyOutAmount: string;
	moneyOutCount: number;
	contributors: number;
	campaigns: number;
	programs: number;
	recipients: number;
	overallRecipientsActive: number;
	overallRecipientsFormer: number;
	overallRecipientsSuspended: number;
	overallRecipientsFuture: number;
	overallCandidates: number;
	overallPayoutsTotal: number;
	overallPayoutsConfirmed: number;
	overallPayoutsContested: number;
	overallPayoutsFailed: number;
	countries: MonthlySummaryCountryTemplateData[];
	localPartners: MonthlySummaryLocalPartnerTemplateData[];
};

type SendgridTemplateData = {
	[MONTHLY_SUMMARY_TEMPLATE]: MonthlySummaryTemplateData;
};

type SendgridTemplate = keyof SendgridTemplateData;

type SendEmailInput<T extends SendgridTemplate> = {
	to: string | string[];
	subject: string;
	text: string;
	template: T;
	data: SendgridTemplateData[T];
};

export const createMonthlySummaryTemplateData = (summary: MonthlySummary): MonthlySummaryTemplateData => {
	const { overall, countries, localPartners } = summary.stats;

	return {
		month: summary.period.from.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC',
		}),
		moneyInAmount: summary.moneyIn.amountChf.toLocaleString('en-CH'),
		moneyInCount: summary.moneyIn.count,
		moneyOutAmount: summary.moneyOut.amountChf.toLocaleString('en-CH'),
		moneyOutCount: summary.moneyOut.count,
		contributors: summary.new.contributors,
		campaigns: summary.new.campaigns,
		programs: summary.new.programs,
		recipients: summary.new.recipients,
		overallRecipientsActive: overall.recipients.active,
		overallRecipientsFormer: overall.recipients.former,
		overallRecipientsSuspended: overall.recipients.suspended,
		overallRecipientsFuture: overall.recipients.future,
		overallCandidates: overall.candidates,
		overallPayoutsTotal: overall.payouts.total,
		overallPayoutsConfirmed: overall.payouts.confirmed,
		overallPayoutsContested: overall.payouts.contested,
		overallPayoutsFailed: overall.payouts.failed,
		countries: Object.entries(countries).map(([name, stats]) => ({
			name,
			recipientsActive: stats.recipients.active,
			recipientsFormer: stats.recipients.former,
			recipientsSuspended: stats.recipients.suspended,
			recipientsFuture: stats.recipients.future,
			candidates: stats.candidates,
			payoutsTotal: stats.payouts.total,
			payoutsConfirmed: stats.payouts.confirmed,
			payoutsContested: stats.payouts.contested,
			payoutsFailed: stats.payouts.failed,
		})),
		localPartners: localPartners.map((partner) => ({
			name: partner.name,
			country: partner.countryIsoCodes.join(', ') || 'n/a',
			recipientsActive: partner.stats.recipients.active,
			recipientsFormer: partner.stats.recipients.former,
			recipientsSuspended: partner.stats.recipients.suspended,
			recipientsFuture: partner.stats.recipients.future,
			programs: partner.programs,
		})),
	};
};

export class SendgridMailService extends BaseService {
	private initialized = false;

	constructor(db: PrismaClient) {
		super(db);
	}

	async send<T extends SendgridTemplate>(input: SendEmailInput<T>): Promise<ServiceResult<void>> {
		try {
			const from = process.env.SENDGRID_FROM_EMAIL;
			const templateId = process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID;

			if (!process.env.SENDGRID_API_KEY || !from || !templateId) {
				return {
					success: false,
					error: 'Missing required SendGrid environment variables',
				};
			}

			await this.sendEmail(input, from, templateId);
			await this.storeSentEmails(input, from);

			return { success: true, data: undefined };
		} catch (error) {
			console.error('Error sending email:', error);

			return {
				success: false,
				error: `Unable to send email: ${String(error)}`,
			};
		}
	}

	private async sendEmail<T extends SendgridTemplate>(
		input: SendEmailInput<T>,
		from: string,
		templateId: string,
	): Promise<void> {
		const apiKey = process.env.SENDGRID_API_KEY;

		if (!this.initialized && apiKey) {
			sgMail.setApiKey(apiKey);
			this.initialized = true;
		}

		console.info('Sending email with SendGrid:', {
			to: input.to,
			from,
			templateId,
			dynamicTemplateData: input.data,
		});

		await sgMail.send({
			to: input.to,
			from,
			templateId,
			dynamicTemplateData: input.data,
		});
	}

	private async storeSentEmails<T extends SendgridTemplate>(input: SendEmailInput<T>, from: string): Promise<void> {
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
