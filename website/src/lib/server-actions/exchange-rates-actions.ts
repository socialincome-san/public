'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ExchangeRateService } from '@socialincome/shared/src/database/services/exchange-rate/exchange-rate.service';
import { revalidatePath } from 'next/cache';

export async function importExchangeRatesAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new ExchangeRateService();

	const result = await service.triggerImportAsAdmin(user.id);
	revalidatePath('/portal/admin/exchange-rates');
	return result;
}
