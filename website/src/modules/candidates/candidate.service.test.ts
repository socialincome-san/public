import { CountryCode } from '@/generated/prisma/enums';

const mockIsAdmin = jest.fn();
const mockRecipientEntity = { type: 'recipient' };
const mockFindCandidateById = jest.fn();
const mockFindPaginatedCandidates = jest.fn();
const mockCountCandidates = jest.fn();
const mockFindUnassignedCandidateIds = jest.fn();
const mockUpdateUnassignedCandidateAssignments = jest.fn();
const audit = { actor: { type: 'user' as const, id: 'user-1' }, source: 'portal' as const };
const mockGetOperatorProgramCountriesForUser = jest.fn();

jest.mock('@/modules/recipients/recipient.service', () => ({ recipientAuditedEntity: mockRecipientEntity }));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: jest.fn(),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getOperatorProgramCountriesForUser: mockGetOperatorProgramCountriesForUser,
}));

jest.mock('@/modules/auth/auth.service', () => ({}));

jest.mock('./candidate.repository.read', () => ({
	findCandidateById: mockFindCandidateById,
	findPaginatedCandidates: mockFindPaginatedCandidates,
	countCandidates: mockCountCandidates,
	findUnassignedCandidateIds: mockFindUnassignedCandidateIds,
}));
jest.mock('./candidate.repository.write', () => ({
	updateUnassignedCandidateAssignments: mockUpdateUnassignedCandidateAssignments,
}));

import {
	assignRandomCandidatesToProgram,
	getCandidate,
	getCandidateCount,
	getPaginatedCandidateTableViewForOperator,
} from './candidate.service';

describe('candidate service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('rejects a local partner reading another partners candidate', async () => {
		mockFindCandidateById.mockResolvedValue({
			id: 'candidate-1',
			programId: null,
			localPartnerId: 'partner-2',
		});

		await expect(
			getCandidate(
				{
					type: 'local-partner',
					id: 'partner-1',
					name: 'Partner',
					focuses: [],
					gender: null,
					email: null,
					firstName: null,
					lastName: null,
					language: null,
					street: null,
					number: null,
					city: null,
					zip: null,
					country: null,
				},
				'candidate-1',
			),
		).resolves.toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
	});

	test('returns the unfiltered candidate count', async () => {
		mockCountCandidates.mockResolvedValue(12);

		await expect(getCandidateCount([], [], null)).resolves.toEqual({
			success: true,
			data: { count: 12 },
			status: undefined,
		});
	});

	test('limits the operator pool to countries from all of the user’s operator programs', async () => {
		const query = { page: 1, pageSize: 10, search: '' };
		mockGetOperatorProgramCountriesForUser.mockResolvedValue({ success: true, data: [CountryCode.GH, CountryCode.SL] });
		mockFindPaginatedCandidates.mockResolvedValue({ candidates: [], totalCount: 0, filterSource: [] });

		await expect(getPaginatedCandidateTableViewForOperator('user-1', query)).resolves.toMatchObject({
			success: true,
			data: {
				tableRows: [],
				totalCount: 0,
				countryFilterOptions: [],
				genderFilterOptions: [],
				localPartnerFilterOptions: [],
			},
		});
		expect(mockFindPaginatedCandidates).toHaveBeenCalledWith({
			query,
			localPartnerId: undefined,
			country: undefined,
			gender: undefined,
			allowedCountryCodes: [CountryCode.GH, CountryCode.SL],
		});
	});

	test('returns an empty pool without querying candidates when the user has no operator countries', async () => {
		mockGetOperatorProgramCountriesForUser.mockResolvedValue({ success: true, data: [] });

		await expect(
			getPaginatedCandidateTableViewForOperator('user-1', { page: 1, pageSize: 10, search: '' }),
		).resolves.toMatchObject({
			success: true,
			data: { tableRows: [], totalCount: 0 },
		});
		expect(mockFindPaginatedCandidates).not.toHaveBeenCalled();
	});

	test('filters candidate counts by local partner', async () => {
		mockCountCandidates.mockResolvedValue(4);

		await expect(getCandidateCount([], [], null, ['partner-1'])).resolves.toEqual({
			success: true,
			data: { count: 4 },
			status: undefined,
		});
		expect(mockCountCandidates).toHaveBeenCalledWith({
			countryCode: null,
			focusIds: [],
			profiles: [],
			localPartnerIds: ['partner-1'],
		});
	});

	test('assigns random candidates only from selected local partners', async () => {
		const filter = {
			countryCode: CountryCode.SL,
			focusIds: [],
			profiles: [],
			localPartnerIds: ['partner-1'],
		};
		mockUpdateUnassignedCandidateAssignments.mockResolvedValue({ outcome: 'assigned', assigned: 1 });

		mockFindUnassignedCandidateIds.mockResolvedValue([{ id: 'candidate-1' }, { id: 'candidate-2' }]);

		await expect(assignRandomCandidatesToProgram(audit, 'program-1', 1, filter)).resolves.toEqual({
			success: true,
			data: { assigned: 1 },
			status: undefined,
		});
		expect(mockFindUnassignedCandidateIds).toHaveBeenCalledWith(filter);
		expect(mockUpdateUnassignedCandidateAssignments).toHaveBeenCalledWith(
			mockRecipientEntity,
			audit,
			['candidate-1', 'candidate-2'],
			'program-1',
			1,
		);
	});

	test('returns a fixed failure when the pool does not have enough candidates', async () => {
		mockFindUnassignedCandidateIds.mockResolvedValue([]);
		mockUpdateUnassignedCandidateAssignments.mockResolvedValue({ outcome: 'insufficient' });

		await expect(
			assignRandomCandidatesToProgram(audit, 'program-1', 2, {
				countryCode: CountryCode.SL,
				focusIds: [],
				profiles: [],
				localPartnerIds: [],
			}),
		).resolves.toEqual({
			success: false,
			error: 'Not enough candidates available',
			status: undefined,
		});
	});
});
