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
