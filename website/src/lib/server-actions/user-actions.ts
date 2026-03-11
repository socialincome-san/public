'use server';

import { ROUTES } from '@/lib/constants/routes';
import { getSessionByType } from '@/lib/firebase/current-account';
import { ServiceResult } from '@/lib/services/core/base.types';
import { services } from '@/lib/services/services';
import { UserFormCreateInput, UserFormUpdateInput } from '@/lib/services/user/user-form-input';
import { UserUpdateInput } from '@/lib/services/user/user.types';
import { revalidatePath } from 'next/cache';

export const createUserAction = async (input: UserFormCreateInput): Promise<ServiceResult<unknown>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.user.create(session.id, input);

	if (result.success) {
		revalidatePath(ROUTES.portalAdminUsers);
	}

	return result;
};

export const updateUserAction = async (input: UserFormUpdateInput): Promise<ServiceResult<unknown>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.user.update(session.id, input);

	if (result.success) {
		revalidatePath(ROUTES.portalAdminUsers);
	}

	return result;
};

export const updateUserSelfAction = async (input: UserUpdateInput): Promise<ServiceResult<unknown>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.user.updateSelf(session.id, input);

	if (result.success) {
		revalidatePath(ROUTES.portalProfile);
	}

	return result;
};

export const getUserAction = async (userId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	return services.read.user.get(session.id, userId);
};

export const getUserOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	return services.read.user.getOptions(session.id);
};
