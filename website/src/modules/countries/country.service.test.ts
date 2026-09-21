import type { ServiceResult } from '@/lib/service-result';

const mockIsAdmin = jest.fn();
const mockFindCountryById = jest.fn();
const mockFindPaginatedCountries = jest.fn();
const mockFindCountriesForFeasibility = jest.fn();
const mockFindUnassignedRecipientCountries = jest.fn();
const mockFindPublicCountryStats = jest.fn();
const mockFindCountryByIsoCode = jest.fn();
const mockCreateCountry = jest.fn();
const mockUpdateCountry = jest.fn();
const mockFindCountryForDeletion = jest.fn();
const mockDeleteCountry = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/integrations/world-bank/world-bank.integration', () => ({
	fetchWorldBankIndicator: jest.fn(),
}));

jest.mock('./country.repository', () => ({
	findCountryById: mockFindCountryById,
	findPaginatedCountries: mockFindPaginatedCountries,
	findCountriesForFeasibility: mockFindCountriesForFeasibility,
	findUnassignedRecipientCountries: mockFindUnassignedRecipientCountries,
	findPublicCountryStats: mockFindPublicCountryStats,
	findCountryByIsoCode: mockFindCountryByIsoCode,
	createCountry: mockCreateCountry,
	updateCountry: mockUpdateCountry,
	findCountryForDeletion: mockFindCountryForDeletion,
	deleteCountry: mockDeleteCountry,
}));

import { getPaginatedCountryTableView, getProgramCountryFeasibility } from './country.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
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

const createCandidate = (contactCountry?: string | null, localPartnerCountry?: string | null) => ({
	contact: { address: { country: contactCountry ?? null } },
	localPartner: {
		contact: { address: { country: localPartnerCountry ?? null } },
	},
});

describe('country service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('requires admin access for the country table', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		const result = await getPaginatedCountryTableView('user-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(result).toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
		expect(mockFindPaginatedCountries).not.toHaveBeenCalled();
	});

	test('aggregates candidate counts by resolved country', async () => {
		mockFindCountriesForFeasibility.mockResolvedValue([
			createCountry('country-sl', 'SL'),
			createCountry('country-ke', 'KE'),
			createCountry('country-ug', 'UG'),
		]);
		mockFindUnassignedRecipientCountries.mockResolvedValue([
			createCandidate('SL', 'KE'),
			createCandidate(null, 'KE'),
			createCandidate(undefined, 'KE'),
			createCandidate(null, null),
		]);

		const data = expectSuccess(await getProgramCountryFeasibility());

		expect(data.rows.find((row) => row.id === 'country-sl')?.stats.candidateCount).toBe(1);
		expect(data.rows.find((row) => row.id === 'country-ke')?.stats.candidateCount).toBe(2);
		expect(data.rows.find((row) => row.id === 'country-ug')?.stats.candidateCount).toBe(0);
	});
});
