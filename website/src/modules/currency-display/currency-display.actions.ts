'use server';

import { resultFail, type Result } from '@/lib/result';
import type { DisplayAmountsByCurrency } from '@/modules/currency-display/currency-display.types';
import { chfAmountsDisplayInputSchema, walletPayoutDisplayInputsSchema } from './currency-display.schemas';
import { resolveChfAmounts, resolveWalletPayoutDisplays } from './currency-display.service';

export const resolveChfAmountsAction = async (input: unknown): Promise<Result<DisplayAmountsByCurrency>> => {
	const parsed = chfAmountsDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid currency display input');
	}

	return resolveChfAmounts(parsed.data);
};

export const resolveWalletPayoutDisplaysAction = async (input: unknown): Promise<Result<DisplayAmountsByCurrency>> => {
	const parsed = walletPayoutDisplayInputsSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplays(parsed.data);
};
