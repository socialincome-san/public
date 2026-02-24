'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { UserCreateInput, UserUpdateInput } from '@/lib/services/user/user.types';
import { revalidatePath } from 'next/cache';

export const createUserAction = async (input: UserCreateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await services.user.create(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserAction = async (input: UserUpdateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await services.user.update(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserSelfAction = async (input: UserUpdateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await services.user.updateSelf(session.id, input);

	if (result.success) {
		revalidatePath('/portal/profile');
	}

	return result;
};

export const getUserAction = async (userId: string) => {
	const session = await getAuthenticatedUserOrRedirect();
	return services.user.get(session.id, userId);
};

export const getUserOptionsAction = async () => {
	const session = await getAuthenticatedUserOrRedirect();
	return services.user.getOptions(session.id);
};
