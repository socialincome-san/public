'use server';

import { ROUTES } from '@/lib/constants/routes';
import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { resultOk } from '@/lib/services/core/service-result';
import type {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = ROUTES.portalAdminMobileMoneyProviders;

export const createMobileMoneyProviderAction = async (input: MobileMoneyProviderFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.mobileMoneyProvider.create(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const updateMobileMoneyProviderAction = async (input: MobileMoneyProviderFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.mobileMoneyProvider.update(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const getMobileMoneyProviderAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.mobileMoneyProvider.get(sessionResult.data.id, id);
};

export const deleteMobileMoneyProviderAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.mobileMoneyProvider.delete(sessionResult.data.id, id);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const getMobileMoneyProviderOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.mobileMoneyProvider.getOptions(sessionResult.data.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return resultOk([]);
	}
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.mobileMoneyProvider.getSupportedOptions();
};
