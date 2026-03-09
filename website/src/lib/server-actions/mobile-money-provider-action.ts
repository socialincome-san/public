'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import { Session } from '../firebase/current-account';

const REVALIDATE_PATH = '/portal/admin/mobile-money-providers';

export const createMobileMoneyProviderAction = async (input: MobileMoneyProviderCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await services.write.mobileMoneyProvider.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const updateMobileMoneyProviderAction = async (input: MobileMoneyProviderUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await services.write.mobileMoneyProvider.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const getMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return services.read.mobileMoneyProvider.get(user.id, id);
};

export const deleteMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await services.write.mobileMoneyProvider.delete(user.id, id);
	revalidatePath(REVALIDATE_PATH);
	return result;
};

export const getMobileMoneyProviderOptionsAction = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	return services.read.mobileMoneyProvider.getOptions(user.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return { success: true, data: [] };
	}
	await getAuthenticatedUserOrRedirect();
	return services.read.mobileMoneyProvider.getSupportedOptions();
};
