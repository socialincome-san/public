'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ROUTES } from '@/lib/constants/routes';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const importExchangeRatesAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.exchangeRate.triggerImportAsAdmin(sessionResult.data.id);
	revalidatePath(ROUTES.portalAdminExchangeRates);
	return result;
};
