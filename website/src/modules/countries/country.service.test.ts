import { UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type { UserSession } from '@/modules/users/user.types';

const mockIsAdmin = jest.fn();
const mockFindCountryById = jest.fn();
const mockFindPaginatedCountries = jest.fn();
const mockFindCountriesForFeasibility = jest.fn();
const mockFindUnassignedRecipientCountries = jest.fn();
const mockFindPublicCountryStats = jest.fn();
const mockCountCandidatesForLocalPartnerCountry = jest.fn();
const mockFindCountryByIsoCode = jest.fn();
const mockCreateCountry = jest.fn();
const mockUpdateCountry = jest.fn();
const mockFindCountryForDeletion = jest.fn();
const mockDeleteCountry = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getUnassignedRecipientCountries: mockFindUnassignedRecipientCountries,
	countCandidatesForLocalPartnerCountry: mockCountCandidatesForLocalPartnerCountry,
}));

jest.mock('@/integrations/world-bank/world-bank.integration', () => ({
	fetchWorldBankIndicator: jest.fn(),
}));

jest.mock('./country.repository.read', () => ({
	findCountryById: mockFindCountryById,
	findPaginatedCountries: mockFindPaginatedCountries,
	findCountriesForFeasibility: mockFindCountriesForFeasibility,
	findPublicCountryStats: mockFindPublicCountryStats,
	findCountryByIsoCode: mockFindCountryByIsoCode,
	findCountryForDeletion: mockFindCountryForDeletion,
}));

jest.mock('./country.repository.write', () => ({
	createCountry: mockCreateCountry,
	updateCountry: mockUpdateCountry,
	deleteCountry: mockDeleteCountry,
}));

import {
	deleteCountry,
	getCountryPageStats,
	getPaginatedCountryTableView,
	getProgramCountryFeasibility,
} from './country.service';

const expectSuccess = <T>(result: Result<T>): T => {
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
	contactCountry: contactCountry ?? null,
	localPartnerCountry: localPartnerCountry ?? null,
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

	test('passes the provider filter to the country repository', async () => {
		const query = { page: 1, pageSize: 10, search: '', mobileMoneyProviderId: 'provider-1' };
		mockFindPaginatedCountries.mockResolvedValue({ countries: [], totalCount: 0 });

		await getPaginatedCountryTableView('admin-1', query);

		expect(mockFindPaginatedCountries).toHaveBeenCalledWith(query);
	});

	test('aggregates candidate counts by resolved country', async () => {
		mockFindCountriesForFeasibility.mockResolvedValue([
			createCountry('country-sl', 'SL'),
			createCountry('country-ke', 'KE'),
			createCountry('country-ug', 'UG'),
		]);
		mockFindUnassignedRecipientCountries.mockResolvedValue({
			success: true,
			data: [
				createCandidate('SL', 'KE'),
				createCandidate(null, 'KE'),
				createCandidate(undefined, 'KE'),
				createCandidate(null, null),
			],
		});

		const data = expectSuccess(await getProgramCountryFeasibility());

		expect(data.rows.find((row) => row.id === 'country-sl')?.stats.candidateCount).toBe(1);
		expect(data.rows.find((row) => row.id === 'country-ke')?.stats.candidateCount).toBe(2);
		expect(data.rows.find((row) => row.id === 'country-ug')?.stats.candidateCount).toBe(0);
	});

	test('counts candidates by local partner country on the country page', async () => {
		mockFindPublicCountryStats.mockResolvedValue([
			{ ...createCountry('country-sl', 'SL'), programs: [{ _count: { recipients: 4 } }], _count: { programs: 1 } },
		]);
		mockCountCandidatesForLocalPartnerCountry.mockResolvedValue({ success: true, data: 3 });

		const data = expectSuccess(await getCountryPageStats('sl'));

		expect(data).toEqual({ activeProgramsCount: 1, recipientsCount: 4, candidatesCount: 3 });
		expect(mockCountCandidatesForLocalPartnerCountry).toHaveBeenCalledWith('SL');
	});

	test('fails the country page stats when the candidate count fails', async () => {
		mockFindPublicCountryStats.mockResolvedValue([
			{ ...createCountry('country-sl', 'SL'), programs: [{ _count: { recipients: 4 } }], _count: { programs: 1 } },
		]);
		mockCountCandidatesForLocalPartnerCountry.mockResolvedValue({
			success: false,
			error: 'Could not count candidates',
		});

		const result = await getCountryPageStats('SL');

		expect(result.success).toBe(false);
	});
});

describe('country write attribution', () => {
	const admin: UserSession = {
		type: 'user',
		id: 'admin-1',
		gender: null,
		email: null,
		firstName: 'Max',
		lastName: 'Admin',
		language: null,
		street: null,
		number: null,
		city: null,
		zip: null,
		country: null,
		role: UserRole.admin,
		activeOrganization: null,
		organizations: [],
		programs: [],
		hasAnyOperatorProgramAccess: false,
	};

	test('attributes deletes to the admin', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindCountryForDeletion.mockResolvedValue({ id: 'entity-1', _count: { programs: 0 } });
		mockDeleteCountry.mockResolvedValue({ id: 'entity-1' });

		await deleteCountry(admin, 'entity-1');

		expect(mockDeleteCountry).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' },
			'entity-1',
		);
	});
});
