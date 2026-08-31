'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { FocusFormCreateInput, FocusFormUpdateInput } from '@/lib/services/focus/focus-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/focuses';

export const createFocusAction = async (input: FocusFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.focus.create(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateFocusAction = async (input: FocusFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.focus.update(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.focus.get(sessionResult.data.id, id);
};

export const deleteFocusAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.focus.delete(sessionResult.data.id, id);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusOptionsAction = async () => {
	return services.read.focus.getOptions();
};
