'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ExchangeRateService } from '@/lib/services/exchange-rate/exchange-rate.service';
import { revalidatePath } from 'next/cache';

const service = new ExchangeRateService();

export const importExchangeRatesAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await service.triggerImportAsAdmin(user.id);
	revalidatePath('/portal/admin/exchange-rates');
	return result;
};

export const getLatestExchangeRatesAction = async () => {
	await getAuthenticatedUserOrThrow();
	return service.getLatestRates();
};
