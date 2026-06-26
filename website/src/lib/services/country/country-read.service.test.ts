import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import { CountryReadService } from './country-read.service';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { KE: 'KE', SL: 'SL', UG: 'UG' },
	NetworkTechnology: { g3: 'g3', g4: 'g4', g5: 'g5', satellite: 'satellite', unknown: 'unknown' },
	Prisma: {},
	PrismaClient: class {},
	SanctionRegime: {},
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const createCountry = (id: string, isoCode: string) => ({
	id,
	isoCode,
	isActive: true,
	currency: 'USD',
	defaultPayoutAmount: 32,
	microfinanceIndex: null,
	cashConditionOverride: false,
	populationCoverage: null,
	networkTechnology: null,
	mobileMoneyProviders: [],
	mobileMoneyConditionOverride: false,
	sanctions: [],
	microfinanceSourceLink: null,
	networkSourceLink: null,
	programs: [],
	_count: { programs: 0 },
});

const createCandidate = ({
	contactCountry,
	localPartnerCountry,
}: {
	contactCountry?: string | null;
	localPartnerCountry?: string | null;
}) => ({
	contact: {
		address: {
			country: contactCountry ?? null,
		},
	},
	localPartner: {
		contact: {
			address: {
				country: localPartnerCountry ?? null,
			},
		},
	},
});

const createService = ({
	countries = [createCountry('country-sl', 'SL'), createCountry('country-ke', 'KE'), createCountry('country-ug', 'UG')],
	candidates = [
		createCandidate({ contactCountry: 'SL', localPartnerCountry: 'KE' }),
		createCandidate({ contactCountry: null, localPartnerCountry: 'KE' }),
		createCandidate({ localPartnerCountry: 'KE' }),
		createCandidate({ contactCountry: null, localPartnerCountry: null }),
	],
} = {}) => {
	const countryFindMany = jest.fn().mockResolvedValue(countries);
	const recipientFindMany = jest.fn().mockResolvedValue(candidates);
	const db = {
		country: { findMany: countryFindMany },
		recipient: { findMany: recipientFindMany },
	};
	const service = new CountryReadService(db as unknown as PrismaClient, {} as never);

	return { service, countryFindMany, recipientFindMany };
};

describe('CountryReadService program country feasibility', () => {
	test('getProgramCountryFeasibility aggregates candidate counts by resolved country', async () => {
		const { service, recipientFindMany } = createService();

		const result = await service.getProgramCountryFeasibility();
		const data = expectSuccess(result);

		expect(recipientFindMany).toHaveBeenCalledTimes(1);
		expect(recipientFindMany).toHaveBeenCalledWith({
			where: { programId: null },
			select: {
				contact: {
					select: {
						address: {
							select: {
								country: true,
							},
						},
					},
				},
				localPartner: {
					select: {
						contact: {
							select: {
								address: {
									select: {
										country: true,
									},
								},
							},
						},
					},
				},
			},
		});
		expect(data.rows.find((row) => row.id === 'country-sl')?.stats.candidateCount).toBe(1);
		expect(data.rows.find((row) => row.id === 'country-ke')?.stats.candidateCount).toBe(2);
		expect(data.rows.find((row) => row.id === 'country-ug')?.stats.candidateCount).toBe(0);
	});
});
