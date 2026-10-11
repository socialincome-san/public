import { createMonthlySummaryEmail } from './monthly-summary-email.service';
import type { MonthlySummary } from './monthly-summary.types';

const partnerStats = {
	recipients: { active: 20, former: 1, suspended: 2, future: 3 },
	candidates: 2,
	payouts: { total: 40, confirmed: 35, contested: 1, failed: 1 },
};

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
		countries: { SL: partnerStats },
		localPartners: [{ name: 'Partner', countryIsoCodes: ['SL'], programs: 2, stats: partnerStats }],
	},
} satisfies MonthlySummary;

describe('createMonthlySummaryEmail', () => {
	const originalTemplateId = process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID;

	beforeEach(() => {
		process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = 'd-template-id';
	});

	afterEach(() => {
		if (originalTemplateId === undefined) {
			delete process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID;
		} else {
			process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID = originalTemplateId;
		}
	});

	test('creates the exact subject and formatted summary text', () => {
		const result = createMonthlySummaryEmail(summary);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.subject).toBe('Monthly summary — August 2026');
		expect(result.data.text).toContain("Here's the summary for August 2026:");
		expect(result.data.text).toContain("- In: CHF 42'300 (128 contributions)");
		expect(result.data.text).toContain('- Out: CHF 31’800 (96 payouts)'.replaceAll('’', "'"));
		expect(result.data.text).toContain('- 14 contributors');
		expect(result.data.text).toContain('50 active, 2 former, 3 suspended, 10 future');
	});

	test('maps the summary to the SendGrid template variables', () => {
		const result = createMonthlySummaryEmail(summary);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.template).toEqual({
			id: 'd-template-id',
			data: {
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
			},
		});
	});

	test('returns an error when the template ID is missing', () => {
		delete process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID;

		expect(createMonthlySummaryEmail(summary)).toEqual({
			success: false,
			error: 'Missing monthly summary SendGrid template',
		});
	});
});
