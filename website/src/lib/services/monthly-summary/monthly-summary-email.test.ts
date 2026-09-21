import { MonthlySummaryEmailTemplate } from './monthly-summary-email';
import type { MonthlySummary } from './monthly-summary.service';

describe('MonthlySummaryEmailTemplate', () => {
	test('creates a subject and text for the summary period', () => {
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

		const result = new MonthlySummaryEmailTemplate().create(summary);

		expect(result.subject).toBe('Monthly summary — August 2026');
		expect(result.text).toContain("Here's the summary for August 2026:");
		expect(result.text).toContain("- In: CHF 42'300 (128 contributions)");
		expect(result.text).toContain('- 14 contributors');
		expect(result.text).toContain('50 active, 2 former, 3 suspended, 10 future');
	});
});
