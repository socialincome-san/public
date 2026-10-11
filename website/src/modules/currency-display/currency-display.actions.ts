'use server';

import { resultFail, type Result } from '@/lib/result';
import type { DisplayAmount } from '@/modules/currency-display/currency-display.types';
import { resolveChfAmounts, resolveWalletPayoutDisplays } from './currency-display.cache';
import { chfAmountsDisplayInputSchema, walletPayoutDisplaysInputSchema } from './currency-display.schemas';

export const resolveChfAmountsAction = async (input: unknown): Promise<Result<DisplayAmount[]>> => {
	const parsed = chfAmountsDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid currency display input');
	}

	return resolveChfAmounts(parsed.data);
};

export const resolveWalletPayoutDisplaysAction = async (input: unknown): Promise<Result<DisplayAmount[]>> => {
	const parsed = walletPayoutDisplaysInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplays(parsed.data);
};
