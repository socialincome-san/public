import { ProgramPermission } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';

const mockFindActiveOrganizationId = jest.fn();
const mockFindProgramAccessesByOrganizationId = jest.fn();
const mockFindOperatorProgramCountriesByUserId = jest.fn();

jest.mock('./program-access.repository', () => ({
	findActiveOrganizationId: mockFindActiveOrganizationId,
	findProgramAccessesByOrganizationId: mockFindProgramAccessesByOrganizationId,
	findOperatorProgramCountriesByUserId: mockFindOperatorProgramCountriesByUserId,
}));

import { getAccessiblePrograms, getOperatorProgramCountriesForUser } from './program-access.service';

const expectSuccess = <T>(result: Result<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: Result<unknown>, error: string): void => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}

	expect(result.error).toBe(error);
};

describe('program access service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns a stable failure when the user has no active organization', async () => {
		mockFindActiveOrganizationId.mockResolvedValue(null);

		const result = await getAccessiblePrograms('user-1');

		expectFailure(result, 'User has no active organization');
		expect(mockFindProgramAccessesByOrganizationId).not.toHaveBeenCalled();
	});

	test('fails closed when a stale activeOrganizationId no longer has organization access', async () => {
		mockFindActiveOrganizationId.mockResolvedValue(null);

		const result = await getAccessiblePrograms('revoked-user');

		expectFailure(result, 'User has no active organization');
		expect(mockFindProgramAccessesByOrganizationId).not.toHaveBeenCalled();
	});

	test('maps persistence records to accessible programs', async () => {
		mockFindActiveOrganizationId.mockResolvedValue('organization-1');
		mockFindProgramAccessesByOrganizationId.mockResolvedValue([
			{
				programId: 'program-1',
				permission: ProgramPermission.operator,
				program: { name: 'Program 1' },
			},
		]);

		const result = await getAccessiblePrograms('user-1');

		expect(expectSuccess(result)).toEqual([
			{
				programId: 'program-1',
				programName: 'Program 1',
				permission: ProgramPermission.operator,
			},
		]);
		expect(mockFindProgramAccessesByOrganizationId).toHaveBeenCalledWith('organization-1');
	});

	test('does not leak persistence errors', async () => {
		mockFindActiveOrganizationId.mockRejectedValue(new Error('database unavailable'));

		const result = await getAccessiblePrograms('user-1');

		expectFailure(result, 'Could not get accessible programs');
	});

	test('returns distinct countries from every operator program the user can access', async () => {
		mockFindOperatorProgramCountriesByUserId.mockResolvedValue([
			{ program: { country: { isoCode: 'GH' } } },
			{ program: { country: { isoCode: 'SL' } } },
			{ program: { country: { isoCode: 'GH' } } },
		]);

		const result = await getOperatorProgramCountriesForUser('user-1');

		expect(expectSuccess(result)).toEqual(['GH', 'SL']);
		expect(mockFindOperatorProgramCountriesByUserId).toHaveBeenCalledWith('user-1');
	});

	test('returns no countries when the user has no operator programs', async () => {
		mockFindOperatorProgramCountriesByUserId.mockResolvedValue([]);

		expect(expectSuccess(await getOperatorProgramCountriesForUser('user-1'))).toEqual([]);
	});

	test('does not leak operator program lookup errors', async () => {
		mockFindOperatorProgramCountriesByUserId.mockRejectedValue(new Error('database unavailable'));

		expectFailure(await getOperatorProgramCountriesForUser('user-1'), 'Could not get operator program countries');
	});
});
