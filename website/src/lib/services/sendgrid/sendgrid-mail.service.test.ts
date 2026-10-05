import sgMail from '@sendgrid/mail';
import type { MonthlySummary } from '../monthly-summary/monthly-summary.service';
import { createMonthlySummaryTemplateData, MONTHLY_SUMMARY_TEMPLATE, SendgridMailService } from './sendgrid-mail.service';

jest.mock('@sendgrid/mail', () => ({
	__esModule: true,
	default: {
		setApiKey: jest.fn(),
		send: jest.fn(),
	},
}));

// SendGrid's methods are replaced by Jest mocks above.
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSetApiKey = sgMail.setApiKey as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockSend = sgMail.send as jest.Mock;

const summary = {
	period: {
		from: new Date('2026-08-01T00:00:00.000Z'),
		to: new Date('2026-09-01T00:00:00.000Z'),
	},
	moneyIn: { amountChf: 42_300, count: 128 },
	moneyOut: { amountChf: 31_800, count: 96 },
	new: { contributors: 14, campaigns: 2, programs: 1, recipients: 8 },
	stats: {
		overall: {
			recipients: { active: 50, former: 2, suspended: 3, future: 10 },
			candidates: 4,
			payouts: { total: 96, confirmed: 80, contested: 2, failed: 1 },
		},
		countries: {
			SL: {
				recipients: { active: 20, former: 1, suspended: 2, future: 3 },
				candidates: 2,
				payouts: { total: 40, confirmed: 35, contested: 1, failed: 1 },
			},
		},
		localPartners: [
			{
				name: 'Partner',
				countryIsoCodes: ['SL'],
				programs: 2,
				stats: {
					recipients: { active: 20, former: 1, suspended: 2, future: 3 },
					candidates: 2,
					payouts: { total: 40, confirmed: 35, contested: 1, failed: 1 },
				},
			},
		],
	},
} satisfies MonthlySummary;

const templateData = createMonthlySummaryTemplateData(summary);

describe('SendgridMailService', () => {
	const createDb = () => ({
		contact: { findUnique: jest.fn().mockResolvedValue(null) },
		sentEmail: { create: jest.fn().mockResolvedValue({}) },
	});
	let db = createDb();
	const originalApiKey = process.env.SENDGRID_API_KEY;
	const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;
	const originalTemplateId = process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID;

	beforeEach(() => {
		db = createDb();
		mockSetApiKey.mockReset();
		mockSend.mockReset();
	});

	afterEach(() => {
		process.env.SENDGRID_API_KEY = originalApiKey;
		process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
		process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = originalTemplateId;
	});

	test('maps the monthly summary to the SendGrid template variables', () => {
		expect(templateData).toEqual({
			month: 'August 2026',
			moneyInAmount: "42'300",
			moneyInCount: 128,
			moneyOutAmount: "31'800",
			moneyOutCount: 96,
			contributors: 14,
			campaigns: 2,
			programs: 1,
			recipients: 8,
			overallRecipientsActive: 50,
			overallRecipientsFormer: 2,
			overallRecipientsSuspended: 3,
			overallRecipientsFuture: 10,
			overallCandidates: 4,
			overallPayoutsTotal: 96,
			overallPayoutsConfirmed: 80,
			overallPayoutsContested: 2,
			overallPayoutsFailed: 1,
			countries: [
				{
					name: 'SL',
					recipientsActive: 20,
					recipientsFormer: 1,
					recipientsSuspended: 2,
					recipientsFuture: 3,
					candidates: 2,
					payoutsTotal: 40,
					payoutsConfirmed: 35,
					payoutsContested: 1,
					payoutsFailed: 1,
				},
			],
			localPartners: [
				{
					name: 'Partner',
					country: 'SL',
					recipientsActive: 20,
					recipientsFormer: 1,
					recipientsSuspended: 2,
					recipientsFuture: 3,
					programs: 2,
				},
			],
		});
	});

	test('returns an error when SendGrid configuration is missing', async () => {
		delete process.env.SENDGRID_API_KEY;
		delete process.env.SENDGRID_FROM_EMAIL;

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
			template: MONTHLY_SUMMARY_TEMPLATE,
			data: templateData,
		});

		expect(result).toEqual({
			success: false,
			error: 'Missing required SendGrid environment variables',
		});
		expect(mockSend).not.toHaveBeenCalled();
	});

	test('sends an email to one or more recipients', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = 'd-template-id';
		mockSend.mockResolvedValue([] as never);

		const result = await new SendgridMailService(db as never).send({
			to: ['one@example.com', 'two@example.com'],
			subject: 'Subject',
			text: 'Body',
			template: MONTHLY_SUMMARY_TEMPLATE,
			data: templateData,
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
		expect(mockSend).toHaveBeenCalledWith({
			to: ['one@example.com', 'two@example.com'],
			from: 'sender@example.com',
			templateId: 'd-template-id',
			dynamicTemplateData: templateData,
		});
		expect(db.sentEmail.create).toHaveBeenCalledTimes(2);
	});

	test('returns an error when SendGrid fails', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = 'd-template-id';
		mockSend.mockRejectedValue(new Error('SendGrid unavailable'));

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
			template: MONTHLY_SUMMARY_TEMPLATE,
			data: templateData,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unable to send email: Error: SendGrid unavailable',
		});
		expect(db.sentEmail.create).not.toHaveBeenCalled();
	});

	test('returns an error when storing the sent email fails', async () => {
		process.env.SENDGRID_API_KEY = 'test-api-key';
		process.env.SENDGRID_FROM_EMAIL = 'sender@example.com';
		process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = 'd-template-id';
		mockSend.mockResolvedValue([] as never);
		jest.mocked(db.sentEmail.create).mockRejectedValue(new Error('Database unavailable'));

		const result = await new SendgridMailService(db as never).send({
			to: 'recipient@example.com',
			subject: 'Subject',
			text: 'Body',
			template: MONTHLY_SUMMARY_TEMPLATE,
			data: templateData,
		});

		expect(result).toEqual({
			success: false,
			error: 'Unable to send email: Error: Database unavailable',
		});
	});
});
