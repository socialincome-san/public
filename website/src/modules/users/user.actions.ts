'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail } from '@/lib/services/core/service-result';
import { revalidatePath } from 'next/cache';
import { userCreateSchema, userIdSchema, userSelfUpdateSchema, userUpdateSchema } from './user.schemas';
import { createUser, deleteUser, getUser, getUserOptions, updateUser, updateUserSelf } from './user.service';
import type { UserPayload } from './user.types';

export const createUserAction = async (input: unknown): Promise<ServiceResult<UserPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = userCreateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createUser(sessionResult.data.id, parsedInput.data);
	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserAction = async (input: unknown): Promise<ServiceResult<UserPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = userUpdateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateUser(sessionResult.data.id, parsedInput.data);
	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const deleteUserAction = async (userId: unknown): Promise<ServiceResult<void>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedUserId = userIdSchema.safeParse(userId);
	if (!parsedUserId.success) {
		return resultFail(parsedUserId.error.issues[0]?.message ?? 'Invalid user id.');
	}

	const result = await deleteUser(sessionResult.data.id, parsedUserId.data);
	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserSelfAction = async (input: unknown): Promise<ServiceResult<UserPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedInput = userSelfUpdateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateUserSelf(sessionResult.data.id, parsedInput.data);
	if (result.success) {
		revalidatePath('/portal/profile/account');
		revalidatePath('/portal/profile/organization');
	}

	return result;
};

export const getUserAction = async (userId: unknown): Promise<ServiceResult<UserPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsedUserId = userIdSchema.safeParse(userId);
	if (!parsedUserId.success) {
		return resultFail(parsedUserId.error.issues[0]?.message ?? 'Invalid user id.');
	}

	return getUser(sessionResult.data.id, parsedUserId.data);
};

export const getUserOptionsAction = async (): Promise<ServiceResult<{ id: string; name: string }[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getUserOptions(sessionResult.data.id);
};
