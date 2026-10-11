'use server';

import type { Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import { triggerExchangeRateImportAsAdmin } from '@/modules/exchange-rates/exchange-rate.service';
import { revalidatePath } from 'next/cache';

export const importExchangeRatesAction = async (): Promise<Result<void>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await triggerExchangeRateImportAsAdmin(sessionResult.data.id);
	revalidatePath('/portal/admin/exchange-rates');

	return result;
};
