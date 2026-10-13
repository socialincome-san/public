import { CountryCode } from '@/generated/prisma/enums';

const mockIsAdmin = jest.fn();
const mockFindCandidateById = jest.fn();
const mockCountCandidates = jest.fn();
const mockUpdateCandidateProgramAssignmentsAtomically = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: jest.fn(),
}));

jest.mock('@/modules/auth/auth.service', () => ({}));

jest.mock('./candidate.repository', () => ({
	findCandidateById: mockFindCandidateById,
	countCandidates: mockCountCandidates,
	updateCandidateProgramAssignmentsAtomically: mockUpdateCandidateProgramAssignmentsAtomically,
}));

import { assignRandomCandidatesToProgram, getCandidate, getCandidateCount } from './candidate.service';

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

	test('filters candidate counts by local partner', async () => {
		mockCountCandidates.mockResolvedValue(4);

		await expect(getCandidateCount([], [], null, ['partner-1'])).resolves.toEqual({
			success: true,
			data: { count: 4 },
			status: undefined,
		});
		expect(mockCountCandidates).toHaveBeenCalledWith([], [], null, ['partner-1']);
	});

	test('assigns random candidates only from selected local partners', async () => {
		mockUpdateCandidateProgramAssignmentsAtomically.mockResolvedValue(1);

		await expect(assignRandomCandidatesToProgram('program-1', 1, CountryCode.SL, [], [], ['partner-1'])).resolves.toEqual({
			success: true,
			data: { assigned: 1 },
			status: undefined,
		});
		expect(mockUpdateCandidateProgramAssignmentsAtomically).toHaveBeenCalledWith('program-1', 1, CountryCode.SL, { focuses: [], profiles: [], localPartnerIds: ['partner-1'] });
	});

	test('returns a fixed error if another request exhausted the pool', async () => {
		mockUpdateCandidateProgramAssignmentsAtomically.mockRejectedValue(new Error('CANDIDATE_POOL_EXHAUSTED'));
		await expect(assignRandomCandidatesToProgram('program-1', 2, CountryCode.SL)).resolves.toEqual({
			success: false,
			error: 'Not enough candidates available',
			status: undefined,
		});
	});

	test('passes the country and filters to the atomic assignment', async () => {
		mockUpdateCandidateProgramAssignmentsAtomically.mockResolvedValue(2);
		await expect(assignRandomCandidatesToProgram('program-1', 2, CountryCode.GH, ['focus-1'], [], ['partner-1']))
			.resolves.toEqual({ success: true, data: { assigned: 2 }, status: undefined });
		expect(mockUpdateCandidateProgramAssignmentsAtomically).toHaveBeenCalledWith(
			'program-1', 2, CountryCode.GH,
			{ focuses: ['focus-1'], profiles: [], localPartnerIds: ['partner-1'] },
		);
	});
});
