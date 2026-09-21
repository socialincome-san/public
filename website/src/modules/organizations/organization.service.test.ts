import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

const mockIsAdmin = jest.fn();
const mockGetUserRole = jest.fn();
const mockFindActiveOrganizationId = jest.fn();
const mockFindOrganizationSummary = jest.fn();
const mockFindPaginatedOrganizations = jest.fn();
const mockFindOrganizationByName = jest.fn();
const mockFindUsersByIds = jest.fn();
const mockGetProgramReferenceOptions = jest.fn();
const mockValidateProgramIds = jest.fn();
const mockCreateOrganization = jest.fn();
const mockFindOperatorProgramAccess = jest.fn();
const mockUpdateOrganizationName = jest.fn();
const mockFindOrganizationIdentity = jest.fn();
const mockFindOrganizationUsageCounts = jest.fn();
const mockDeleteOrganization = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
	getUserRole: mockGetUserRole,
}));

jest.mock('@/modules/programs/program-reference.service', () => ({
	getProgramReferenceOptions: mockGetProgramReferenceOptions,
	validateProgramIds: mockValidateProgramIds,
}));

jest.mock('./organization.repository', () => ({
	findActiveOrganizationId: mockFindActiveOrganizationId,
	findOrganizationSummary: mockFindOrganizationSummary,
	findPaginatedOrganizations: mockFindPaginatedOrganizations,
	findOrganizationByName: mockFindOrganizationByName,
	findUsersByIds: mockFindUsersByIds,
	createOrganization: mockCreateOrganization,
	findOperatorProgramAccess: mockFindOperatorProgramAccess,
	updateOrganizationName: mockUpdateOrganizationName,
	findOrganizationIdentity: mockFindOrganizationIdentity,
	findOrganizationUsageCounts: mockFindOrganizationUsageCounts,
	deleteOrganization: mockDeleteOrganization,
}));

import {
	createOrganization,
	deleteOrganization,
	getActiveOrganizationSummary,
	getPaginatedOrganizationAdminTableView,
	renameActiveOrganization,
} from './organization.service';

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

describe('organization service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockGetUserRole.mockResolvedValue({ success: true, data: UserRole.user });
	});

	test('maps organization counts for the admin table', async () => {
		mockFindPaginatedOrganizations.mockResolvedValue({
			organizations: [
				{
					id: 'organization-1',
					name: 'Organization 1',
					createdAt: new Date('2026-01-01T00:00:00.000Z'),
					organizationAccesses: [{ id: 'access-1' }, { id: 'access-2' }],
					programAccesses: [
						{ programId: 'program-1', permission: ProgramPermission.owner },
						{ programId: 'program-2', permission: ProgramPermission.operator },
					],
				},
			],
			totalCount: 1,
		});

		const result = await getPaginatedOrganizationAdminTableView('admin-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(expectSuccess(result).tableRows[0]).toMatchObject({
			ownedProgramsCount: 1,
			operatedProgramsCount: 1,
			usersCount: 2,
		});
	});

	test('returns a stable failure without an active organization', async () => {
		mockFindActiveOrganizationId.mockResolvedValue(null);

		const result = await getActiveOrganizationSummary('user-1');

		expectFailure(result, 'User has no active organization');
		expect(mockFindOrganizationSummary).not.toHaveBeenCalled();
	});

	test('requires admin or operator access to rename an organization', async () => {
		mockFindActiveOrganizationId.mockResolvedValue('organization-1');
		mockFindOperatorProgramAccess.mockResolvedValue(null);

		const result = await renameActiveOrganization('user-1', { name: 'Renamed' });

		expectFailure(result, 'You do not have permission to rename this organization.');
		expect(mockUpdateOrganizationName).not.toHaveBeenCalled();
	});

	test('validates selected users before creating an organization', async () => {
		mockFindOrganizationByName.mockResolvedValue(null);
		mockFindUsersByIds.mockResolvedValue([]);

		const result = await createOrganization('admin-1', {
			name: 'Organization',
			userIds: ['missing-user'],
			ownedProgramIds: [],
			operatedProgramIds: [],
		});

		expectFailure(result, 'One or more selected users do not exist.');
		expect(mockCreateOrganization).not.toHaveBeenCalled();
	});

	test('does not delete an organization that is still in use', async () => {
		mockFindOrganizationIdentity.mockResolvedValue({ id: 'organization-1', name: 'Organization' });
		mockFindOrganizationUsageCounts.mockResolvedValue({
			activeUsersCount: 1,
			expensesCount: 0,
			programAccessesCount: 0,
		});

		const result = await deleteOrganization('admin-1', 'organization-1');

		expectFailure(result, 'Organization cannot be deleted because it is still in use.');
		expect(mockDeleteOrganization).not.toHaveBeenCalled();
	});
});
