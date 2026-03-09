'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const importExchangeRatesAction = async () => {
const user = await getAuthenticatedUserOrThrow();
const result = await getServices().exchangeRateWrite.triggerImportAsAdmin(user.id);
revalidatePath('/portal/admin/exchange-rates');
return result;
};
