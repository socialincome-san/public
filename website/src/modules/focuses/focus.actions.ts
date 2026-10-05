'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
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
import type { FocusOption, FocusPayload, PublicFocusStatsBySlugMap } from '@/modules/focuses/focus.types';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/focuses';

export const createFocusAction = async (input: unknown): Promise<Result<FocusPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusCreateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await createFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateFocusAction = async (input: unknown): Promise<Result<FocusPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusUpdateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusAction = async (input: unknown): Promise<Result<FocusPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getFocus(sessionResult.data.id, parsedInput.data);
};

export const deleteFocusAction = async (input: unknown): Promise<Result<{ id: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = focusIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await deleteFocus(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getFocusOptionsAction = async (): Promise<Result<FocusOption[]>> => getFocusOptions();

export const getPublicFocusStatsBySlugsAction = async (input: unknown): Promise<Result<PublicFocusStatsBySlugMap>> => {
	const parsedInput = focusSlugsSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getPublicFocusStatsBySlugs(parsedInput.data);
};
