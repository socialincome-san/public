'use server';

import { resultFail, type Result } from '@/lib/result';
import type { DisplayAmount } from '@/modules/currency-display/currency-display.types';
import {
	chfAmountsDisplayInputSchema,
	walletPayoutDisplayInputSchema,
	walletPayoutDisplayInputsSchema,
} from './currency-display.schemas';
import { resolveChfAmounts, resolveWalletPayoutDisplay, resolveWalletPayoutDisplays } from './currency-display.service';

export const resolveChfAmountsAction = async (input: unknown): Promise<Result<DisplayAmount[]>> => {
	const parsed = chfAmountsDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid currency display input');
	}

	return resolveChfAmounts(parsed.data);
};

export const resolveWalletPayoutDisplayAction = async (input: unknown): Promise<Result<DisplayAmount>> => {
	const parsed = walletPayoutDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplay(parsed.data);
};

export const resolveWalletPayoutDisplaysAction = async (input: unknown): Promise<Result<DisplayAmount[]>> => {
	const parsed = walletPayoutDisplayInputsSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplays(parsed.data);
};
