'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { UserReadService } from '@/lib/services/user/user-read.service';
import { UserWriteService } from '@/lib/services/user/user-write.service';
import { UserCreateInput, UserUpdateInput } from '@/lib/services/user/user.types';
import { revalidatePath } from 'next/cache';

const userReadService = new UserReadService();
const userWriteService = new UserWriteService();

export const createUserAction = async (input: UserCreateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await userWriteService.create(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserAction = async (input: UserUpdateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await userWriteService.update(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
};

export const updateUserSelfAction = async (input: UserUpdateInput) => {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await userWriteService.updateSelf(session.id, input);

	if (result.success) {
		revalidatePath('/portal/profile');
	}

	return result;
};

export const getUserAction = async (userId: string) => {
	const session = await getAuthenticatedUserOrRedirect();
	return userReadService.get(session.id, userId);
};

export const getUserOptionsAction = async () => {
	const session = await getAuthenticatedUserOrRedirect();
	return userReadService.getOptions(session.id);
};
