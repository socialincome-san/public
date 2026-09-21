import { MonthlySummaryService } from './monthly-summary.service';

describe('MonthlySummaryService', () => {
	const getRecipientLifecycleStatus = jest.fn().mockReturnValue({ success: true as const, data: 'active' as const });
	const recipientStatusService = { getRecipientLifecycleStatus } as never;

	test('loads last month numbers', async () => {
		getRecipientLifecycleStatus.mockReturnValue({ success: true, data: 'completed' });
		const db = {
			contribution: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: '100' }, _count: { _all: 2 } }) },
			payout: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: '80' }, _count: { _all: 3 } }) },
			contributor: { count: jest.fn().mockResolvedValue(4) },
			campaign: { count: jest.fn().mockResolvedValue(5) },
			program: { count: jest.fn().mockResolvedValue(6) },
			recipient: {
				count: jest.fn().mockResolvedValue(7),
				findMany: jest.fn().mockResolvedValue([
					{
						programId: 'program-1',
						startDate: new Date('2026-01-01'),
						suspendedAt: null,
						program: { programDurationInMonths: 12, payoutInterval: 'monthly', country: { isoCode: 'SL' } },
						localPartner: { name: 'Partner' },
						payouts: [{ status: 'confirmed' }, { status: 'failed' }],
					},
				]),
			},
		} as never;

		const result = await new MonthlySummaryService(db, recipientStatusService).getLastMonth();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.moneyIn).toEqual({ amountChf: 100, count: 2 });
		expect(result.data.moneyOut).toEqual({ amountChf: 80, count: 3 });
		expect(result.data.new).toEqual({ contributors: 4, campaigns: 5, programs: 6, recipients: 7 });
		expect(result.data.stats.overall).toEqual({
			recipients: { active: 0, former: 1, suspended: 0, future: 0 },
			candidates: 0,
			payouts: { total: 1, confirmed: 1, contested: 0, failed: 1 },
		});
		expect(result.data.stats.countries.SL).toEqual(result.data.stats.overall);
	});

	test('counts candidates separately from recipients', async () => {
		getRecipientLifecycleStatus.mockReturnValue({ success: true, data: 'active' });
		const db = {
			contribution: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: null }, _count: { _all: 0 } }) },
			payout: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: null }, _count: { _all: 0 } }) },
			contributor: { count: jest.fn().mockResolvedValue(0) },
			campaign: { count: jest.fn().mockResolvedValue(0) },
			program: { count: jest.fn().mockResolvedValue(0) },
			recipient: {
				count: jest.fn().mockResolvedValue(0),
				findMany: jest.fn().mockResolvedValue([
					{
						programId: null,
						startDate: null,
						suspendedAt: null,
						program: null,
						localPartner: { name: 'Partner' },
						payouts: [],
					},
				]),
			},
		} as never;

		const result = await new MonthlySummaryService(db, recipientStatusService).getLastMonth();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.stats.overall.candidates).toBe(1);
		expect(result.data.stats.overall.recipients).toEqual({ active: 0, former: 0, suspended: 0, future: 0 });
	});

	test('returns a failed result when loading fails', async () => {
		const db = {
			contribution: { aggregate: jest.fn().mockRejectedValue(new Error('Database unavailable')) },
			payout: { aggregate: jest.fn() },
			contributor: { count: jest.fn() },
			campaign: { count: jest.fn() },
			program: { count: jest.fn() },
			recipient: { count: jest.fn(), findMany: jest.fn() },
		} as never;
		const result = await new MonthlySummaryService(db, recipientStatusService).getLastMonth();

		expect(result).toEqual({ success: false, error: 'Unable to load monthly summary: Error: Database unavailable' });
	});
});
