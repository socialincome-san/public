import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';

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
const mockFindPaginatedOrganizationMembers = jest.fn();

const mockUpdateOrganizationMembers = jest.fn();
const mockUpdateOrganizationProgramAccesses = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
	getUserRole: mockGetUserRole,
	updateOrganizationMembers: mockUpdateOrganizationMembers,
}));

jest.mock('@/modules/programs/program.service', () => ({
	updateOrganizationProgramAccesses: mockUpdateOrganizationProgramAccesses,
}));

jest.mock('@/modules/programs/program-reference.service', () => ({
	getProgramReferenceOptions: mockGetProgramReferenceOptions,
	validateProgramIds: mockValidateProgramIds,
}));

jest.mock('./organization.repository.write', () => ({
	createOrganization: mockCreateOrganization,
	updateOrganizationName: mockUpdateOrganizationName,
	deleteOrganization: mockDeleteOrganization,
}));

jest.mock('./organization.repository.read', () => ({
	findActiveOrganizationId: mockFindActiveOrganizationId,
	findOrganizationSummary: mockFindOrganizationSummary,
	findPaginatedOrganizations: mockFindPaginatedOrganizations,
	findOrganizationByName: mockFindOrganizationByName,
	findUsersByIds: mockFindUsersByIds,
	findOperatorProgramAccess: mockFindOperatorProgramAccess,
	findOrganizationIdentity: mockFindOrganizationIdentity,
	findOrganizationUsageCounts: mockFindOrganizationUsageCounts,
	findPaginatedOrganizationMembers: mockFindPaginatedOrganizationMembers,
}));

import type { UserSession } from '@/modules/users/user.types';
import {
	createOrganization,
	deleteOrganization,
	getActiveOrganizationSummary,
	getPaginatedOrganizationAdminMembersTableView,
	getPaginatedOrganizationAdminTableView,
	renameActiveOrganization,
} from './organization.service';

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

const sessionOf = (id: string, role: UserRole): UserSession => ({
	type: 'user',
	id,
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
	role,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: false,
});
const admin = sessionOf('admin-1', UserRole.admin);
const portal = { actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' };

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

	test('loads members for the selected organization in admin scope', async () => {
		mockFindPaginatedOrganizationMembers.mockResolvedValue({
			members: [
				{
					user: {
						id: 'user-1',
						role: UserRole.user,
						contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.org' },
					},
				},
			],
			totalCount: 1,
		});

		const result = await getPaginatedOrganizationAdminMembersTableView('admin-1', {
			organizationId: 'organization-1',
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(mockFindPaginatedOrganizationMembers).toHaveBeenCalledWith('organization-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});
		expect(expectSuccess(result).tableRows[0]).toEqual({
			id: 'user-1',
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@example.org',
			role: UserRole.user,
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

		const result = await renameActiveOrganization(sessionOf('user-1', UserRole.user), { name: 'Renamed' });

		expectFailure(result, 'You do not have permission to rename this organization.');
		expect(mockUpdateOrganizationName).not.toHaveBeenCalled();
	});

	test('validates selected users before creating an organization', async () => {
		mockFindOrganizationByName.mockResolvedValue(null);
		mockFindUsersByIds.mockResolvedValue([]);

		const result = await createOrganization(admin, {
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

		const result = await deleteOrganization(admin, 'organization-1');

		expectFailure(result, 'Organization cannot be deleted because it is still in use.');
		expect(mockDeleteOrganization).not.toHaveBeenCalled();
	});

	test('writes program accesses and members through their modules after the organization', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindOrganizationByName.mockResolvedValue(null);
		mockFindUsersByIds.mockResolvedValue([{ id: 'user-1' }]);
		mockValidateProgramIds.mockResolvedValue({ success: true, data: true });
		mockCreateOrganization.mockResolvedValue({ id: 'organization-1', name: 'Organization' });
		mockUpdateOrganizationProgramAccesses.mockResolvedValue({ success: true, data: undefined });
		mockUpdateOrganizationMembers.mockResolvedValue({ success: true, data: undefined });

		await createOrganization(admin, {
			name: 'Organization',
			userIds: ['user-1'],
			ownedProgramIds: ['program-1'],
			operatedProgramIds: [],
		});

		expect(mockCreateOrganization).toHaveBeenCalledWith(portal, 'Organization');
		expect(mockUpdateOrganizationProgramAccesses).toHaveBeenCalledWith(portal, {
			organizationId: 'organization-1',
			ownedProgramIds: ['program-1'],
			operatedProgramIds: [],
		});
		expect(mockUpdateOrganizationMembers).toHaveBeenCalledWith(portal, {
			organizationId: 'organization-1',
			memberIds: ['user-1'],
		});
	});

	test('points to editing when a created organization has no programs or members saved', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindOrganizationByName.mockResolvedValue(null);
		mockFindUsersByIds.mockResolvedValue([]);
		mockValidateProgramIds.mockResolvedValue({ success: true, data: true });
		mockCreateOrganization.mockResolvedValue({ id: 'organization-1', name: 'Organization' });
		mockUpdateOrganizationProgramAccesses.mockResolvedValue({ success: false, error: 'Could not update' });

		const result = await createOrganization(admin, {
			name: 'Organization',
			userIds: [],
			ownedProgramIds: ['program-1'],
			operatedProgramIds: [],
		});

		expectFailure(result, 'The organization was created, but its programs or members could not be saved. Edit it to retry.');
		expect(mockUpdateOrganizationMembers).not.toHaveBeenCalled();
	});

	test('removes memberships before deleting an organization', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindOrganizationIdentity.mockResolvedValue({ id: 'organization-1', name: 'Organization' });
		mockFindOrganizationUsageCounts.mockResolvedValue({ activeUsersCount: 0, expensesCount: 0, programAccessesCount: 0 });
		mockUpdateOrganizationMembers.mockResolvedValue({ success: true, data: undefined });

		await deleteOrganization(admin, 'organization-1');

		expect(mockUpdateOrganizationMembers).toHaveBeenCalledWith(portal, { organizationId: 'organization-1', memberIds: [] });
		expect(mockDeleteOrganization).toHaveBeenCalledWith(portal, 'organization-1');
		expect(mockUpdateOrganizationMembers.mock.invocationCallOrder[0]).toBeLessThan(
			mockDeleteOrganization.mock.invocationCallOrder[0] ?? 0,
		);
	});
});
