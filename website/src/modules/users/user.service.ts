import { ProgramPermission } from '@/generated/prisma/enums';
import {
	createFirebaseUserByEmail,
	deleteFirebaseUserByUidIfExists,
	findFirebaseUserByEmail,
	updateFirebaseUserByUid,
} from '@/integrations/firebase/firebase-auth.integration';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { isAdminRole } from './user.permissions';
import * as userRepository from './user.repository';
import type { CreateUserInput, UpdateUserInput, UpdateUserSelfInput } from './user.schemas';
import type { UserPaginatedTableView, UserPayload, UserSession, UserTableQuery, UserTableViewRow } from './user.types';

export const getUser = async (actorUserId: string, userId: string): Promise<ServiceResult<UserPayload>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const user = await userRepository.findUserById(userId);
		if (!user) {
			return resultFail('User not found');
		}

		return resultOk({
			id: user.id,
			firstName: user.contact.firstName,
			lastName: user.contact.lastName,
			email: user.contact.email,
			role: user.role,
			organizationId: user.activeOrganization?.id ?? null,
			organizationIds: user.organizationAccesses.map((access) => access.organizationId),
		});
	} catch (error) {
		console.error('Could not fetch user', { actorUserId, userId, error });

		return resultFail('Could not fetch user');
	}
};

export const getUserOptions = async (actorUserId: string): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		return resultOk(await userRepository.findOrganizationOptions());
	} catch (error) {
		console.error('Could not load user options', { actorUserId, error });

		return resultFail('Could not load user options');
	}
};

export const getPaginatedUserTableView = async (
	actorUserId: string,
	query: UserTableQuery,
): Promise<ServiceResult<UserPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { users, totalCount } = await userRepository.findPaginatedUsers(query);
		const tableRows: UserTableViewRow[] = users.map((user) => ({
			id: user.id,
			firstName: user.contact?.firstName ?? null,
			lastName: user.contact?.lastName ?? null,
			email: user.contact?.email ?? null,
			firebaseAuthUserId: user.account.firebaseAuthUserId,
			role: user.role,
			organizationName: user.activeOrganization?.name ?? null,
			organizationNames: user.organizationAccesses
				.map((access) => access.organization.name)
				.sort((a, b) => a.localeCompare(b))
				.join(', '),
			createdAt: user.createdAt,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch users', { actorUserId, error });

		return resultFail('Could not fetch users');
	}
};

export const getCurrentUserSession = async (firebaseAuthUserId: string): Promise<ServiceResult<UserSession>> => {
	try {
		const user = await userRepository.findUserSessionByFirebaseAuthUserId(firebaseAuthUserId);
		if (!user) {
			return resultFail('User not found');
		}

		const contact = user.contact;
		const programs = user.activeOrganization
			? Array.from(
					new Map(
						user.activeOrganization.programAccesses.map((access) => [
							access.program.id,
							{ id: access.program.id, name: access.program.name },
						]),
					).values(),
				)
			: [];

		return resultOk({
			type: 'user',
			id: user.id,
			role: user.role,
			firstName: contact?.firstName ?? null,
			lastName: contact?.lastName ?? null,
			email: contact?.email ?? null,
			gender: contact?.gender ?? null,
			language: contact?.language ?? null,
			street: contact?.address?.street ?? null,
			number: contact?.address?.number ?? null,
			city: contact?.address?.city ?? null,
			zip: contact?.address?.zip ?? null,
			country: contact?.address?.country ?? null,
			activeOrganization: user.activeOrganization
				? {
						id: user.activeOrganization.id,
						name: user.activeOrganization.name,
					}
				: null,
			organizations: user.organizationAccesses.map((access) => ({
				id: access.organization.id,
				name: access.organization.name,
			})),
			programs,
			hasAnyOperatorProgramAccess: Boolean(
				user.activeOrganization?.programAccesses.some((access) => access.permission === ProgramPermission.operator),
			),
		});
	} catch (error) {
		console.error('Could not fetch user session', { firebaseAuthUserId, error });

		return resultFail('Error fetching user information');
	}
};

export const isAdmin = async (userId: string): Promise<ServiceResult<true>> => {
	try {
		const user = await userRepository.findUserRole(userId);
		if (!user) {
			return resultFail('User not found');
		}

		return isAdminRole(user.role) ? resultOk(true) : resultFail('Permission denied');
	} catch (error) {
		console.error('Could not check admin status', { userId, error });

		return resultFail('Could not check admin status');
	}
};

export const createUser = async (actorUserId: string, input: CreateUserInput): Promise<ServiceResult<UserPayload>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const uniquenessResult = await validateEmailUniqueness(input.email);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		const activeOrganizationId = getPreferredActiveOrganizationId(input.organizationIds);
		if (!activeOrganizationId) {
			return resultFail('At least one organization permission is required.');
		}

		const existingFirebaseUserResult = await findFirebaseUserByEmail(input.email);
		if (!existingFirebaseUserResult.success) {
			return resultFail(`Failed to check Firebase user: ${existingFirebaseUserResult.error}`);
		}

		const displayName = `${input.firstName} ${input.lastName}`.trim();
		const firebaseUserResult = existingFirebaseUserResult.data
			? resultOk(existingFirebaseUserResult.data)
			: await createFirebaseUserByEmail({ email: input.email, displayName });
		if (!firebaseUserResult.success) {
			return resultFail(`Failed to create Firebase user: ${firebaseUserResult.error}`);
		}

		const firebaseUser = firebaseUserResult.data;
		const didCreateFirebaseUser = !existingFirebaseUserResult.data;
		let createdUser: Awaited<ReturnType<typeof userRepository.createUser>>;
		try {
			createdUser = await userRepository.createUser(input, firebaseUser.uid, activeOrganizationId);
		} catch (error) {
			if (didCreateFirebaseUser) {
				const rollbackResult = await deleteFirebaseUserByUidIfExists(firebaseUser.uid);
				if (!rollbackResult.success) {
					console.warn('Could not rollback Firebase user after failed user creation', {
						firebaseUid: firebaseUser.uid,
						error: rollbackResult.error,
					});
				}
			}

			console.error('Could not persist user', { actorUserId, error });

			return resultFail('Could not create user. Please try again later.');
		}

		const firebaseSyncResult = await updateFirebaseUserByUid(firebaseUser.uid, {
			email: input.email,
			displayName,
			emailVerified: true,
		});
		if (!firebaseSyncResult.success) {
			console.warn('Could not fully sync Firebase Auth user on user creation', {
				firebaseUid: firebaseUser.uid,
				error: firebaseSyncResult.error,
			});
		}

		return resultOk(toUserPayload(createdUser, input.organizationIds));
	} catch (error) {
		console.error('Could not create user', { actorUserId, error });

		return resultFail('Could not create user. Please try again later.');
	}
};

export const updateUser = async (actorUserId: string, input: UpdateUserInput): Promise<ServiceResult<UserPayload>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const existingUser = await userRepository.findUserForUpdate(input.id);
		if (!existingUser) {
			return resultFail('User not found');
		}

		const uniquenessResult = await validateEmailUniqueness(input.email, existingUser.contact.id);
		if (!uniquenessResult.success) {
			return uniquenessResult;
		}

		const activeOrganizationId = getPreferredActiveOrganizationId(input.organizationIds, existingUser.activeOrganizationId);
		const updatedUser = await userRepository.updateUser(input, activeOrganizationId);
		const newDisplayName = `${input.firstName} ${input.lastName}`.trim();
		const oldDisplayName = `${existingUser.contact.firstName} ${existingUser.contact.lastName}`.trim();
		const shouldSyncFirebaseUser = input.email !== existingUser.contact.email || newDisplayName !== oldDisplayName;

		if (shouldSyncFirebaseUser) {
			const firebaseUpdateResult = await updateFirebaseUserByUid(existingUser.account.firebaseAuthUserId, {
				email: input.email,
				displayName: newDisplayName,
				emailVerified: true,
			});
			if (!firebaseUpdateResult.success) {
				console.warn('Could not fully sync Firebase Auth user on user update', {
					firebaseUid: existingUser.account.firebaseAuthUserId,
					error: firebaseUpdateResult.error,
				});
			}
		}

		return resultOk(toUserPayload(updatedUser, input.organizationIds));
	} catch (error) {
		console.error('Could not update user', { actorUserId, userId: input.id, error });

		return resultFail('Could not update user. Please try again later.');
	}
};

export const updateUserSelf = async (userId: string, input: UpdateUserSelfInput): Promise<ServiceResult<UserPayload>> => {
	try {
		const existingUser = await userRepository.findUserForSelfUpdate(userId);
		if (!existingUser) {
			return resultFail('User not found');
		}

		if (input.email && input.email !== existingUser.contact.email) {
			return resultFail('You cannot change your email yourself.');
		}

		const allowedOrganizationIds = existingUser.organizationAccesses.map((access) => access.organizationId);
		const activeOrganizationId =
			input.organizationId && allowedOrganizationIds.includes(input.organizationId) ? input.organizationId : undefined;
		const updatedUser = await userRepository.updateUserSelf(userId, input, activeOrganizationId);

		return resultOk(
			toUserPayload(
				updatedUser,
				updatedUser.organizationAccesses.map((access) => access.organizationId),
			),
		);
	} catch (error) {
		console.error('Could not update user', { userId, error });

		return resultFail('Could not update user');
	}
};

export const deleteUser = async (actorUserId: string, targetUserId: string): Promise<ServiceResult<void>> => {
	try {
		const isAdminResult = await isAdmin(actorUserId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		if (actorUserId === targetUserId) {
			return resultFail('You cannot delete your own user account.');
		}

		const existingUser = await userRepository.findUserForDeletion(targetUserId);
		if (!existingUser) {
			return resultFail('User not found');
		}

		await userRepository.deleteUserData(targetUserId, existingUser.contactId, existingUser.accountId);

		const firebaseDeleteResult = await deleteFirebaseUserByUidIfExists(existingUser.account.firebaseAuthUserId);
		if (!firebaseDeleteResult.success) {
			console.warn('User deleted in DB but Firebase user deletion failed', {
				userId: targetUserId,
				firebaseUid: existingUser.account.firebaseAuthUserId,
				error: firebaseDeleteResult.error,
			});
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not delete user', { actorUserId, targetUserId, error });

		return resultFail('Could not delete user. Please try again later.');
	}
};

const validateEmailUniqueness = async (email: string, existingContactId?: string): Promise<ServiceResult<void>> => {
	const emailConflict = await userRepository.findContactByEmail(email);
	if (emailConflict && emailConflict.id !== existingContactId) {
		return resultFail('A user with this email already exists.');
	}

	return resultOk(undefined);
};

const getPreferredActiveOrganizationId = (
	organizationIds: string[],
	currentActiveOrganizationId?: string | null,
): string | null => {
	const allowedOrganizationIds = new Set(organizationIds);
	if (currentActiveOrganizationId && allowedOrganizationIds.has(currentActiveOrganizationId)) {
		return currentActiveOrganizationId;
	}

	return organizationIds[0] ?? null;
};

const toUserPayload = (
	user: {
		id: string;
		role: UserPayload['role'];
		contact: {
			firstName: string | null;
			lastName: string | null;
			email: string | null;
		};
		activeOrganization: {
			id: string;
		} | null;
	},
	organizationIds: string[],
): UserPayload => ({
	id: user.id,
	firstName: user.contact.firstName,
	lastName: user.contact.lastName,
	email: user.contact.email,
	role: user.role,
	organizationId: user.activeOrganization?.id ?? null,
	organizationIds,
});
