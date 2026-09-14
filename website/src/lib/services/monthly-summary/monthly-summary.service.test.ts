import { MonthlySummaryService } from './monthly-summary.service';

describe('MonthlySummaryService', () => {
	test('loads last month numbers', async () => {
		const db = {
			contribution: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: '100' }, _count: { _all: 2 } }) },
			payout: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: '80' }, _count: { _all: 3 } }) },
			contributor: { count: jest.fn().mockResolvedValue(4) },
			campaign: { count: jest.fn().mockResolvedValue(5) },
			program: { count: jest.fn().mockResolvedValue(6) },
			recipient: { count: jest.fn().mockResolvedValue(7) },
		} as never;

		const result = await new MonthlySummaryService(db).getLastMonth();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.moneyIn).toEqual({ amountChf: 100, count: 2 });
		expect(result.data.moneyOut).toEqual({ amountChf: 80, count: 3 });
		expect(result.data.new).toEqual({ contributors: 4, campaigns: 5, programs: 6, recipients: 7 });
	});

	test('returns a failed result when loading fails', async () => {
		const db = { contribution: { aggregate: jest.fn().mockRejectedValue(new Error('Database unavailable')) } } as never;
		const result = await new MonthlySummaryService(db).getLastMonth();

		expect(result).toEqual({ success: false, error: 'Unable to load monthly summary: Error: Database unavailable' });
	});
});
