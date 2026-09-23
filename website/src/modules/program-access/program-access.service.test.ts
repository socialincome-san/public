import { ProgramPermission } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

const mockFindActiveOrganizationId = jest.fn();
const mockFindProgramAccessesByOrganizationId = jest.fn();
const mockCreateInitialProgramAccesses = jest.fn();

jest.mock('./program-access.repository', () => ({
	findActiveOrganizationId: mockFindActiveOrganizationId,
	findProgramAccessesByOrganizationId: mockFindProgramAccessesByOrganizationId,
	createInitialProgramAccesses: mockCreateInitialProgramAccesses,
}));

import { createInitialAccessesForProgram, getAccessiblePrograms } from './program-access.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string): void => {
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

	test('creates owner and operator accesses through the repository', async () => {
		const input = {
			programId: 'program-1',
			ownerOrganizationId: 'owner-organization',
			operatorFallbackOrganizationId: 'operator-organization',
		};
		mockCreateInitialProgramAccesses.mockResolvedValue({ count: 2 });

		const result = await createInitialAccessesForProgram(input);

		expect(expectSuccess(result)).toBeUndefined();
		expect(mockCreateInitialProgramAccesses).toHaveBeenCalledWith(input);
	});

	test('does not leak persistence errors', async () => {
		mockFindActiveOrganizationId.mockRejectedValue(new Error('database unavailable'));

		const result = await getAccessiblePrograms('user-1');

		expectFailure(result, 'Could not get accessible programs');
	});
});
