import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';

const mockFindUserRole = jest.fn();
const mockFindContactByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockFindUserForSelfUpdate = jest.fn();
const mockUpdateUserSelf = jest.fn();
const mockFindUserSessionByFirebaseAuthUserId = jest.fn();
const mockFindUserForDeletion = jest.fn();
const mockDeleteUserData = jest.fn();
const mockFindFirebaseUserByEmail = jest.fn();
const mockCreateFirebaseUserByEmail = jest.fn();
const mockUpdateFirebaseUserByUid = jest.fn();
const mockDeleteFirebaseUserByUidIfExists = jest.fn();

const mockFindOrganizationMemberIds = jest.fn();
const mockUpdateOrganizationMembers = jest.fn();

jest.mock('./user.repository.read', () => ({
	findUserRole: mockFindUserRole,
	findContactByEmail: mockFindContactByEmail,
	findUserForSelfUpdate: mockFindUserForSelfUpdate,
	findUserSessionByFirebaseAuthUserId: mockFindUserSessionByFirebaseAuthUserId,
	findUserForDeletion: mockFindUserForDeletion,
	findOrganizationMemberIds: mockFindOrganizationMemberIds,
}));

jest.mock('./user.repository.write', () => ({
	createUser: mockCreateUser,
	updateUserSelf: mockUpdateUserSelf,
	deleteUser: mockDeleteUserData,
	updateOrganizationMembers: mockUpdateOrganizationMembers,
}));

jest.mock('@/modules/auth/auth.service', () => ({
	findFirebaseUserByEmail: mockFindFirebaseUserByEmail,
	createFirebaseUserByEmail: mockCreateFirebaseUserByEmail,
	updateFirebaseUserByUid: mockUpdateFirebaseUserByUid,
	deleteFirebaseUserByUidIfExists: mockDeleteFirebaseUserByUidIfExists,
}));

import {
	createUser,
	deleteUser,
	getCurrentUserSession,
	isAdmin,
	updateOrganizationMembers,
	updateUserSelf,
} from './user.service';
import type { UserSession } from './user.types';

const sessionOf = (id: string, firstName: string): UserSession => ({
	type: 'user',
	id,
	gender: null,
	email: null,
	firstName,
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
});
const admin = sessionOf('admin-1', 'Max');

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

describe('user service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindUserRole.mockResolvedValue({ role: UserRole.admin });
	});

	test('requires an admin role', async () => {
		expect(expectSuccess(await isAdmin('admin-1'))).toBe(true);

		mockFindUserRole.mockResolvedValue({ role: UserRole.user });
		expectFailure(await isAdmin('user-1'), 'Permission denied');
	});

	test('creates a database user and synchronizes an existing Firebase user', async () => {
		const input = {
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@example.org',
			role: UserRole.user,
			organizationIds: ['organization-1'],
		};
		mockFindContactByEmail.mockResolvedValue(null);
		mockFindFirebaseUserByEmail.mockResolvedValue({
			success: true,
			data: { uid: 'firebase-1' },
		});
		mockCreateUser.mockResolvedValue({
			id: 'user-1',
			role: UserRole.user,
			contact: {
				firstName: 'Ada',
				lastName: 'Lovelace',
				email: 'ada@example.org',
			},
			activeOrganization: { id: 'organization-1' },
		});
		mockUpdateFirebaseUserByUid.mockResolvedValue({ success: true, data: { uid: 'firebase-1' } });

		const result = await createUser(admin, input);

		expect(expectSuccess(result)).toEqual({
			id: 'user-1',
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@example.org',
			role: UserRole.user,
			organizationId: 'organization-1',
			organizationIds: ['organization-1'],
		});
		expect(mockCreateFirebaseUserByEmail).not.toHaveBeenCalled();
		expect(mockCreateUser).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' },
			input,
			'firebase-1',
			'organization-1',
		);
		expect(mockUpdateFirebaseUserByUid).toHaveBeenCalledWith('firebase-1', {
			email: 'ada@example.org',
			displayName: 'Ada Lovelace',
			emailVerified: true,
		});
	});

	test('prevents self-service email changes', async () => {
		mockFindUserForSelfUpdate.mockResolvedValue({
			contact: { email: 'current@example.org' },
			organizationAccesses: [],
		});

		const result = await updateUserSelf(sessionOf('user-1', 'Ada'), { email: 'next@example.org' });

		expectFailure(result, 'You cannot change your email yourself.');
		expect(mockUpdateUserSelf).not.toHaveBeenCalled();
	});

	test('builds the user session and deduplicates accessible programs', async () => {
		mockFindUserSessionByFirebaseAuthUserId.mockResolvedValue({
			id: 'user-1',
			role: UserRole.user,
			contact: null,
			activeOrganization: {
				id: 'organization-1',
				name: 'Organization 1',
				programAccesses: [
					{
						program: { id: 'program-1', name: 'Program 1' },
						permission: ProgramPermission.owner,
					},
					{
						program: { id: 'program-1', name: 'Program 1' },
						permission: ProgramPermission.operator,
					},
				],
			},
			organizationAccesses: [
				{
					organization: { id: 'organization-1', name: 'Organization 1' },
				},
			],
		});

		const session = expectSuccess(await getCurrentUserSession('firebase-1'));

		expect(session.programs).toEqual([{ id: 'program-1', name: 'Program 1' }]);
		expect(session.hasAnyOperatorProgramAccess).toBe(true);
	});

	test('prevents admins from deleting their own account', async () => {
		const result = await deleteUser(admin, 'admin-1');

		expectFailure(result, 'You cannot delete your own user account.');
		expect(mockFindUserForDeletion).not.toHaveBeenCalled();
		expect(mockDeleteUserData).not.toHaveBeenCalled();
	});

	test('stores an event for every user whose organization membership changes', async () => {
		const audit = { actor: { type: 'user' as const, id: 'admin-1' }, source: 'portal' as const };
		mockFindOrganizationMemberIds.mockResolvedValue([{ userId: 'user-old' }, { userId: 'user-1' }]);

		await updateOrganizationMembers(audit, { organizationId: 'organization-1', memberIds: ['user-1', 'user-new'] });

		expect(mockUpdateOrganizationMembers).toHaveBeenCalledWith(audit, ['user-old', 'user-1', 'user-new'], {
			organizationId: 'organization-1',
			memberIds: ['user-1', 'user-new'],
		});
	});
});
