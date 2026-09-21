import { ProgramPermission, UserRole } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/services/core/base.types';

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

jest.mock('./user.repository', () => ({
	findUserRole: mockFindUserRole,
	findContactByEmail: mockFindContactByEmail,
	createUser: mockCreateUser,
	findUserForSelfUpdate: mockFindUserForSelfUpdate,
	updateUserSelf: mockUpdateUserSelf,
	findUserSessionByFirebaseAuthUserId: mockFindUserSessionByFirebaseAuthUserId,
	findUserForDeletion: mockFindUserForDeletion,
	deleteUserData: mockDeleteUserData,
}));

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({
	findFirebaseUserByEmail: mockFindFirebaseUserByEmail,
	createFirebaseUserByEmail: mockCreateFirebaseUserByEmail,
	updateFirebaseUserByUid: mockUpdateFirebaseUserByUid,
	deleteFirebaseUserByUidIfExists: mockDeleteFirebaseUserByUidIfExists,
}));

import { createUser, deleteUser, getCurrentUserSession, isAdmin, updateUserSelf } from './user.service';

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

		const result = await createUser('admin-1', input);

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
		expect(mockCreateUser).toHaveBeenCalledWith(input, 'firebase-1', 'organization-1');
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

		const result = await updateUserSelf('user-1', { email: 'next@example.org' });

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
		const result = await deleteUser('admin-1', 'admin-1');

		expectFailure(result, 'You cannot delete your own user account.');
		expect(mockFindUserForDeletion).not.toHaveBeenCalled();
		expect(mockDeleteUserData).not.toHaveBeenCalled();
	});
});
