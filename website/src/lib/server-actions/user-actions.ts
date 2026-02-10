'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { UserService } from '@/lib/services/user/user.service';
import { UserCreateInput, UserUpdateInput } from '@/lib/services/user/user.types';
import { revalidatePath } from 'next/cache';

const service = new UserService();

export async function createUserAction(input: UserCreateInput) {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await service.create(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
}

export async function updateUserAction(input: UserUpdateInput) {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await service.update(session.id, input);

	if (result.success) {
		revalidatePath('/portal/admin/users');
	}

	return result;
}

export async function updateUserSelfAction(input: UserUpdateInput) {
	const session = await getAuthenticatedUserOrRedirect();
	const result = await service.updateSelf(session.id, input);

	if (result.success) {
		revalidatePath('/portal/profile');
	}

	return result;
}

export async function getUserAction(userId: string) {
	const session = await getAuthenticatedUserOrRedirect();
	return service.get(session.id, userId);
}

export async function getUserOptionsAction() {
	const session = await getAuthenticatedUserOrRedirect();
	return service.getOptions(session.id);
}
