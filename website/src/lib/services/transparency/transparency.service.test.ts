import type { PrismaClient } from '@/generated/prisma/client';
import { PayoutStatus } from '@/generated/prisma/enums';
import { format } from 'date-fns';
import { TransparencyService } from './transparency.service';

type CountryContributionQuery = {
	where: {
		createdAt?: {
			gte: Date;
			lt: Date;
		};
	};
};

type TotalContributionsQuery = {
	where: {
		status: string;
		createdAt?: {
			gte: Date;
			lt: Date;
		};
	};
	_sum: {
		amountChf: boolean;
	};
};

type CountryContribution = {
	amountChf: number;
	contributorId: string;
	contributor: {
		contact: {
			address: {
				country: 'CH' | 'DE';
			};
		};
	};
};

type PayoutAggregateQuery = {
	where: {
		paymentAt?: {
			gte: Date;
			lt: Date;
		};
		status?: {
			in: PayoutStatus[];
		};
	};
};

const createRunwayService = ({
	reservesChf,
	lastCompletedMonthPaymentsChf,
	reserveRecordedAt = new Date('2026-08-15T12:00:00.000Z'),
}: {
	reservesChf: number;
	lastCompletedMonthPaymentsChf: number;
	reserveRecordedAt?: Date;
}) => {
	const aggregate = jest.fn().mockResolvedValue({ _sum: { amountChf: lastCompletedMonthPaymentsChf } });
	const service = new TransparencyService(
		{ payout: { aggregate } } as unknown as PrismaClient,
		{
			getLatestPerBankAccount: () =>
				Promise.resolve({
					success: true as const,
					data: {
						accounts: [{ recordedAt: reserveRecordedAt }],
						total: reservesChf,
					},
				}),
		} as never,
	);

	return { service, aggregate };
};

describe('TransparencyService.getTotalContributionsChf', () => {
	test('returns only the contribution total for the requested financial period', async () => {
		const aggregate = jest.fn().mockResolvedValue({ _sum: { amountChf: 125 } });
		const service = new TransparencyService({ contribution: { aggregate } } as unknown as PrismaClient, {} as never);

		const result = await service.getTotalContributionsChf({ kind: 'year', year: 2025 });

		expect(result).toEqual({ success: true, data: 125 });
		const [query] = aggregate.mock.calls[0] as [TotalContributionsQuery];
		expect(query.where.status).toBe('succeeded');
		expect(query.where.createdAt?.gte).toBeInstanceOf(Date);
		expect(query.where.createdAt?.lt).toBeInstanceOf(Date);
		expect(query._sum).toEqual({ amountChf: true });
		expect(query).not.toHaveProperty('_count');
	});

	test('returns a failed result when the contribution query fails', async () => {
		const error = new Error('Database unavailable');
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const service = new TransparencyService(
			{ contribution: { aggregate: jest.fn().mockRejectedValue(error) } } as unknown as PrismaClient,
			{} as never,
		);

		const result = await service.getTotalContributionsChf();

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalledWith(error);
		consoleError.mockRestore();
	});
});

describe('TransparencyService.getTransparencySummary', () => {
	test('returns only inflows, outflows, and reserve data', async () => {
		const contributionAggregate = jest.fn().mockResolvedValue({ _sum: { amountChf: 125 } });
		const payoutAggregate = jest.fn().mockResolvedValue({ _sum: { amountChf: 80 } });
		const service = new TransparencyService(
			{
				contribution: { aggregate: contributionAggregate },
				payout: { aggregate: payoutAggregate },
			} as unknown as PrismaClient,
			{
				getLatestPerBankAccount: () =>
					Promise.resolve({
						success: true as const,
						data: {
							accounts: [],
							total: 45,
						},
					}),
			} as never,
		);

		const result = await service.getTransparencySummary({ kind: 'year', year: 2025 });

		expect(result).toEqual({
			success: true,
			data: {
				financialSummary: {
					inflowsChf: 125,
					outflowsChf: 80,
					reservesChf: 45,
				},
				reserveAccounts: [],
			},
		});
		expect(contributionAggregate).toHaveBeenCalledTimes(1);
		expect(payoutAggregate).toHaveBeenCalledTimes(1);
		const [contributionQuery] = contributionAggregate.mock.calls[0] as [TotalContributionsQuery];
		const [payoutQuery] = payoutAggregate.mock.calls[0] as [PayoutAggregateQuery];
		expect(contributionQuery.where.createdAt?.gte).toBeInstanceOf(Date);
		expect(contributionQuery.where.createdAt?.lt).toBeInstanceOf(Date);
		expect(payoutQuery.where.paymentAt?.gte).toBeInstanceOf(Date);
		expect(payoutQuery.where.paymentAt?.lt).toBeInstanceOf(Date);
	});

	test('propagates reserve lookup failures', async () => {
		const service = new TransparencyService(
			{
				contribution: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: 125 } }) },
				payout: { aggregate: jest.fn().mockResolvedValue({ _sum: { amountChf: 80 } }) },
			} as unknown as PrismaClient,
			{
				getLatestPerBankAccount: () => Promise.resolve({ success: false as const, error: 'Reserve lookup failed' }),
			} as never,
		);

		const result = await service.getTransparencySummary();

		expect(result).toEqual({ success: false, error: 'Reserve lookup failed' });
	});
});

describe('TransparencyService.getContributionsByCountryData', () => {
	test('applies the financial period and aggregates countries deterministically', async () => {
		const findMany = jest.fn<Promise<CountryContribution[]>, [CountryContributionQuery]>().mockResolvedValue([
			{
				amountChf: 10,
				contributorId: 'contributor-1',
				contributor: { contact: { address: { country: 'DE' } } },
			},
			{
				amountChf: 15,
				contributorId: 'contributor-1',
				contributor: { contact: { address: { country: 'DE' } } },
			},
			{
				amountChf: 25,
				contributorId: 'contributor-2',
				contributor: { contact: { address: { country: 'CH' } } },
			},
		]);
		const service = new TransparencyService({ contribution: { findMany } } as unknown as PrismaClient, {} as never);

		const result = await service.getContributionsByCountryData(15, { kind: 'year', year: 2025 });

		const [query] = findMany.mock.calls[0] ?? [];
		expect(query?.where.createdAt?.gte).toBeInstanceOf(Date);
		expect(query?.where.createdAt?.lt).toBeInstanceOf(Date);
		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data.totalContributionsChf).toBe(50);
		expect(result.data.segments.map(({ countryCode }) => countryCode)).toEqual(['CH', 'DE']);
	});
});

describe('TransparencyService.getRunwayMonths', () => {
	test('divides latest reserves by last completed month recipient payments and floors full months', async () => {
		const { service, aggregate } = createRunwayService({
			reservesChf: 173780,
			lastCompletedMonthPaymentsChf: 9905,
		});

		const result = await service.getRunwayMonths();

		expect(result).toEqual({ success: true, data: 17 });
		const [query] = aggregate.mock.calls[0] as [PayoutAggregateQuery];
		expect(query.where.status?.in).toEqual([PayoutStatus.paid, PayoutStatus.confirmed]);
		const paymentAt = query.where.paymentAt;
		expect(paymentAt?.gte).toBeInstanceOf(Date);
		expect(paymentAt?.lt).toBeInstanceOf(Date);
		expect(paymentAt?.gte && format(paymentAt.gte, 'yyyy-MM')).toBe('2026-07');
		expect(paymentAt?.lt && format(paymentAt.lt, 'yyyy-MM')).toBe('2026-08');
	});

	test('fails when the last completed month has no recipient payments', async () => {
		const { service } = createRunwayService({
			reservesChf: 173780,
			lastCompletedMonthPaymentsChf: 0,
		});

		const result = await service.getRunwayMonths();

		expect(result).toEqual({ success: false, error: 'No recipient payments in the last completed month' });
	});
});
