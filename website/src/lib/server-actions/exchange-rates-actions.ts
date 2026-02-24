'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const importExchangeRatesAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.exchangeRate.triggerImportAsAdmin(user.id);
	revalidatePath('/portal/admin/exchange-rates');
	return result;
};
