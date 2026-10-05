import { createMonthlySummaryEmail } from './monthly-summary-email.service';
import type { MonthlySummary } from './monthly-summary.types';

describe('createMonthlySummaryEmail', () => {
	test('creates the exact subject and formatted summary text', () => {
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
				countries: {},
				localPartners: [],
			},
		} satisfies MonthlySummary;

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
});
