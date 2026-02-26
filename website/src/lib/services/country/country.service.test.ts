jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
	CountryCode: {},
	NetworkTechnology: {},
	Prisma: { Decimal: class {} },
	SanctionRegime: {},
}));
jest.mock('@/lib/database/prisma', () => ({
	prisma: {},
}));
jest.mock('../user/user.service', () => ({
	UserService: class {
		isAdmin() {
			return Promise.resolve({ success: true, data: true });
		}
	},
}));

import { CountryService } from './country.service';
import { CountryCondition } from './country.types';

type CountryRow = {
	id: string;
	isoCode: string;
	isActive: boolean;
	microfinanceIndex: number | null;
	cashConditionOverride: boolean | null;
	populationCoverage: number | null;
	mobileMoneyProviders: { id: string; name: string }[];
	mobileMoneyConditionOverride: boolean | null;
	sanctions: string[];
	microfinanceSourceLink: { text: string; href: string } | null;
	networkSourceLink: { text: string; href: string } | null;
	programs: Array<{ _count: { recipients: number } }>;
	_count: { programs: number };
};

const buildCountryRow = (overrides: Partial<CountryRow> = {}): CountryRow => ({
	id: 'country-ch',
	isoCode: 'CH',
	isActive: true,
	microfinanceIndex: 3.4,
	cashConditionOverride: false,
	populationCoverage: 80,
	mobileMoneyProviders: [{ id: 'provider-1', name: 'Provider One' }],
	mobileMoneyConditionOverride: false,
	sanctions: [],
	microfinanceSourceLink: { text: 'Source: SI Research', href: 'https://example.org/mfi' },
	networkSourceLink: { text: 'Source: SI Research', href: 'https://example.org/network' },
	programs: [{ _count: { recipients: 10 } }],
	_count: { programs: 1 },
	...overrides,
});

describe('CountryService.getProgramCountryFeasibility', () => {
	test('uses automatic cash condition when override is false', async () => {
		const db = {
			country: { findMany: jest.fn().mockResolvedValue([buildCountryRow({ cashConditionOverride: false })]) },
		};
		const service = new CountryService(db as any);

		const result = await service.getProgramCountryFeasibility();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.rows[0].cash.condition).toBe(CountryCondition.NOT_MET);
		expect(result.data.rows[0].cash.details.text).toContain('may be impaired');
		expect(result.data.rows[0].cash.details.text).toContain('MFI 3.4');
	});

	test('sets cash condition to met when override is true', async () => {
		const db = {
			country: { findMany: jest.fn().mockResolvedValue([buildCountryRow({ cashConditionOverride: true })]) },
		};
		const service = new CountryService(db as any);

		const result = await service.getProgramCountryFeasibility();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.rows[0].cash.condition).toBe(CountryCondition.MET);
		expect(result.data.rows[0].cash.details.text).toContain('appears intact');
	});

	test('sets mobile-money condition to met when override is true', async () => {
		const db = {
			country: {
				findMany: jest.fn().mockResolvedValue([
					buildCountryRow({
						mobileMoneyProviders: [],
						mobileMoneyConditionOverride: true,
					}),
				]),
			},
		};
		const service = new CountryService(db as any);

		const result = await service.getProgramCountryFeasibility();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.rows[0].mobileMoney.condition).toBe(CountryCondition.MET);
		expect(result.data.rows[0].mobileMoney.details.text).toContain('considered sufficient');
	});
});
