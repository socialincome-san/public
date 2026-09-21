'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import {
	focusCreateInputSchema,
	focusIdSchema,
	focusSlugsSchema,
	focusUpdateInputSchema,
} from '@/modules/focuses/focus.schemas';
import {
	createFocus,
	deleteFocus,
	getFocus,
	getFocusOptions,
	getPublicFocusStatsBySlugs,
	updateFocus,
} from '@/modules/focuses/focus.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/focuses';

export const createFocusAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusCreateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateFocusAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusUpdateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	return getFocus(sessionResult.data.id, parsedInput.data);
};

export const deleteFocusAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await deleteFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusOptionsAction = async () => getFocusOptions();

export const getPublicFocusStatsBySlugsAction = async (input: unknown) => {
	const parsedInput = focusSlugsSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
	}

	return getPublicFocusStatsBySlugs(parsedInput.data);
};
