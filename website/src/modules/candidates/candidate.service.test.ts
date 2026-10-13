import { CountryCode } from '@/generated/prisma/enums';

const mockIsAdmin = jest.fn();
const mockFindCandidateById = jest.fn();
const mockCountCandidates = jest.fn();
const mockFindCandidateIdsForAssignment = jest.fn();
const mockUpdateCandidateProgramAssignments = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/countries/country.service', () => ({
	getCountryIsoCode: jest.fn(),
}));

jest.mock('@/modules/auth/auth.service', () => ({}));

jest.mock('./candidate.repository.read', () => ({
	findCandidateById: mockFindCandidateById,
	countCandidates: mockCountCandidates,
	findCandidateIdsForAssignment: mockFindCandidateIdsForAssignment,
}));
jest.mock('./candidate.repository.write', () => ({
	updateCandidateProgramAssignments: mockUpdateCandidateProgramAssignments,
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
		mockFindCandidateIdsForAssignment.mockResolvedValue([{ id: 'candidate-1' }]);
		mockUpdateCandidateProgramAssignments.mockResolvedValue({ count: 1 });

		const audit = { actor: { type: 'user' as const, id: 'user-1' }, source: 'portal' as const };

		await expect(
			assignRandomCandidatesToProgram(audit, 'program-1', 1, CountryCode.SL, [], [], ['partner-1']),
		).resolves.toEqual({
			success: true,
			data: { assigned: 1 },
			status: undefined,
		});
		expect(mockFindCandidateIdsForAssignment).toHaveBeenCalledWith([], [], CountryCode.SL, ['partner-1']);
		expect(mockUpdateCandidateProgramAssignments).toHaveBeenCalledWith(audit, ['candidate-1'], 'program-1');
	});
});
