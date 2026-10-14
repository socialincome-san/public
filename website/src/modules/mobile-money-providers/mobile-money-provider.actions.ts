'use server';

import { resultFail, resultOk, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import type {
	MobileMoneyProviderOption,
	MobileMoneyProviderPaginatedTableView,
	MobileMoneyProviderPayload,
} from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { revalidatePath } from 'next/cache';
import {
	mobileMoneyProviderCreateSchema,
	mobileMoneyProviderIdSchema,
	mobileMoneyProviderSessionTypeSchema,
	mobileMoneyProviderTableQuerySchema,
	mobileMoneyProviderUpdateSchema,
} from './mobile-money-provider.schemas';
import {
	createMobileMoneyProvider,
	deleteMobileMoneyProvider,
	getMobileMoneyProvider,
	getMobileMoneyProviderOptions,
	getPaginatedMobileMoneyProviderTableView,
	getRootMobileMoneyProviderOptions,
	getSupportedMobileMoneyProviderOptions,
	updateMobileMoneyProvider,
} from './mobile-money-provider.service';

const REVALIDATE_PATH = '/portal/admin/mobile-money-providers';

export const getMobileMoneyProviderTableViewAction = async (
	query: unknown,
): Promise<Result<MobileMoneyProviderPaginatedTableView>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedQuery = mobileMoneyProviderTableQuerySchema.safeParse(query);

	return parsedQuery.success
		? getPaginatedMobileMoneyProviderTableView(sessionResult.data.id, parsedQuery.data)
		: resultFail('Invalid mobile money provider query.');
};

export const createMobileMoneyProviderAction = async (input: unknown): Promise<Result<MobileMoneyProviderPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = mobileMoneyProviderCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createMobileMoneyProvider(sessionResult.data, inputResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateMobileMoneyProviderAction = async (input: unknown): Promise<Result<MobileMoneyProviderPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = mobileMoneyProviderUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateMobileMoneyProvider(sessionResult.data, inputResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderAction = async (providerId: unknown): Promise<Result<MobileMoneyProviderPayload>> => {
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

export const deleteMobileMoneyProviderAction = async (providerId: unknown): Promise<Result<{ id: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const providerIdResult = mobileMoneyProviderIdSchema.safeParse(providerId);
	if (!providerIdResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await deleteMobileMoneyProvider(sessionResult.data, providerIdResult.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderOptionsAction = async (): Promise<Result<MobileMoneyProviderOption[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getMobileMoneyProviderOptions(sessionResult.data.id);
};

export const getRootMobileMoneyProviderOptionsAction = async (): Promise<Result<MobileMoneyProviderOption[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getRootMobileMoneyProviderOptions(sessionResult.data.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async (
	sessionType: unknown = 'user',
): Promise<Result<MobileMoneyProviderOption[]>> => {
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
