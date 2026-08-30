import type { PrismaClient } from '@/generated/prisma/client';
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
