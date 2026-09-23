import { ContributionStatus } from '@/generated/prisma/enums';
import type { ContributionDateRange } from './contribution.types';

type AggregateQuery = {
	where: {
		status: ContributionStatus;
		createdAt: ContributionDateRange | undefined;
	};
	_sum: { amountChf: boolean };
};

type CountryRowsQuery = {
	where: {
		status: ContributionStatus;
		createdAt: ContributionDateRange | undefined;
	};
	select: Record<string, unknown>;
};

const mockAggregate = jest.fn<Promise<{ _sum: { amountChf: number | null } }>, [AggregateQuery]>();
const mockFindMany = jest.fn<Promise<never[]>, [CountryRowsQuery]>();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		contribution: {
			aggregate: mockAggregate,
			findMany: mockFindMany,
		},
	},
}));

import { findSucceededContributionsByContributorCountry, findSucceededContributionTotal } from './contribution.repository';

describe('public contribution total repository queries', () => {
	const dateRange = {
		gte: new Date('2025-01-01T00:00:00.000Z'),
		lt: new Date('2026-01-01T00:00:00.000Z'),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockAggregate.mockResolvedValue({ _sum: { amountChf: 0 } });
		mockFindMany.mockResolvedValue([]);
	});

	test('sums only succeeded CHF contributions in the requested period', async () => {
		await findSucceededContributionTotal(dateRange);

		expect(mockAggregate).toHaveBeenCalledWith({
			where: { status: ContributionStatus.succeeded, createdAt: dateRange },
			_sum: { amountChf: true },
		});
	});

	test('selects only fields needed to aggregate contributor countries', async () => {
		await findSucceededContributionsByContributorCountry(dateRange);

		const query = mockFindMany.mock.calls[0]?.[0];
		expect(query?.where).toEqual({
			status: ContributionStatus.succeeded,
			createdAt: dateRange,
			contributor: { contact: { address: { isNot: null } } },
		});
		expect(query?.select).toEqual({
			amountChf: true,
			contributorId: true,
			contributor: {
				select: {
					contact: {
						select: {
							address: {
								select: { country: true },
							},
						},
					},
				},
			},
		});
		expect(query).not.toHaveProperty('include');
	});
});
