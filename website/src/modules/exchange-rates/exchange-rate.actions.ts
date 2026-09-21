'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { triggerExchangeRateImportAsAdmin } from '@/modules/exchange-rates/exchange-rate.service';
import { revalidatePath } from 'next/cache';

export const importExchangeRatesAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await triggerExchangeRateImportAsAdmin(sessionResult.data.id);
	revalidatePath('/portal/admin/exchange-rates');

	return result;
};
