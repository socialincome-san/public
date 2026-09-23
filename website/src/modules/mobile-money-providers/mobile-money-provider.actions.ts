'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, resultOk } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	mobileMoneyProviderCreateSchema,
	mobileMoneyProviderIdSchema,
	mobileMoneyProviderSessionTypeSchema,
	mobileMoneyProviderUpdateSchema,
} from './mobile-money-provider.schemas';
import {
	createMobileMoneyProvider,
	deleteMobileMoneyProvider,
	getMobileMoneyProvider,
	getMobileMoneyProviderOptions,
	getRootMobileMoneyProviderOptions,
	getSupportedMobileMoneyProviderOptions,
	updateMobileMoneyProvider,
} from './mobile-money-provider.service';

const REVALIDATE_PATH = '/portal/admin/mobile-money-providers';

export const createMobileMoneyProviderAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = mobileMoneyProviderCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createMobileMoneyProvider(sessionResult.data.id, inputResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateMobileMoneyProviderAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = mobileMoneyProviderUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateMobileMoneyProvider(sessionResult.data.id, inputResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderAction = async (providerId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const providerIdResult = mobileMoneyProviderIdSchema.safeParse(providerId);
	if (!providerIdResult.success) {
		return resultFail('Invalid input.');
	}

	return getMobileMoneyProvider(sessionResult.data.id, providerIdResult.data);
};

export const deleteMobileMoneyProviderAction = async (providerId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const providerIdResult = mobileMoneyProviderIdSchema.safeParse(providerId);
	if (!providerIdResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await deleteMobileMoneyProvider(sessionResult.data.id, providerIdResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getMobileMoneyProviderOptions(sessionResult.data.id);
};

export const getRootMobileMoneyProviderOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getRootMobileMoneyProviderOptions(sessionResult.data.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async (sessionType: unknown = 'user') => {
	const sessionTypeResult = mobileMoneyProviderSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}
	if (sessionTypeResult.data !== 'user') {
		return resultOk([]);
	}

	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getSupportedMobileMoneyProviderOptions();
};
