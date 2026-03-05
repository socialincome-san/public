'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { MobileMoneyProviderReadService } from '@/lib/services/mobile-money-provider/mobile-money-provider-read.service';
import { MobileMoneyProviderWriteService } from '@/lib/services/mobile-money-provider/mobile-money-provider-write.service';
import type {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { revalidatePath } from 'next/cache';
import { Session } from '../firebase/current-account';

const REVALIDATE_PATH = '/portal/admin/mobile-money-providers';
const mobileMoneyProviderReadService = new MobileMoneyProviderReadService();
const mobileMoneyProviderWriteService = new MobileMoneyProviderWriteService();

export const createMobileMoneyProviderAction = async (input: MobileMoneyProviderCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await mobileMoneyProviderWriteService.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateMobileMoneyProviderAction = async (input: MobileMoneyProviderUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await mobileMoneyProviderWriteService.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return mobileMoneyProviderReadService.get(user.id, id);
};

export const deleteMobileMoneyProviderAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	const result = await mobileMoneyProviderWriteService.delete(user.id, id);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getMobileMoneyProviderOptionsAction = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	return mobileMoneyProviderReadService.getOptions(user.id);
};

export const getSupportedMobileMoneyProviderOptionsAction = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return { success: true, data: [] };
	}
	await getAuthenticatedUserOrRedirect();
	return mobileMoneyProviderReadService.getSupportedOptions();
};
