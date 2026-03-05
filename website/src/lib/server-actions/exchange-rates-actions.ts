'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ExchangeRateWriteService } from '@/lib/services/exchange-rate/exchange-rate-write.service';
import { revalidatePath } from 'next/cache';

const service = new ExchangeRateWriteService();

export const importExchangeRatesAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await service.triggerImportAsAdmin(user.id);
	revalidatePath('/portal/admin/exchange-rates');
	return result;
};
