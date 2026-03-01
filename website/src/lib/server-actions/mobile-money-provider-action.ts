'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { MobileMoneyProviderService } from '@/lib/services/mobile-money-provider/mobile-money-provider.service';
import type {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/mobile-money-providers';
const service = new MobileMoneyProviderService();

export const createMobileMoneyProviderAction = async (input: MobileMoneyProviderCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await service.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateMobileMoneyProviderAction = async (input: MobileMoneyProviderUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await service.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return service.get(user.id, id);
};

export const deleteMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await service.delete(user.id, id);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderOptionsAction = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	return service.getOptions(user.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async () => {
	await getAuthenticatedUserOrRedirect();
	return service.getSupportedOptions();
};
