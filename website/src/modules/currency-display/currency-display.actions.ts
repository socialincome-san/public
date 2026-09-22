'use server';

import { resultFail } from '@/lib/service-result';
import {
	chfAmountsDisplayInputSchema,
	walletPayoutDisplayInputSchema,
	walletPayoutDisplayInputsSchema,
} from './currency-display.schemas';
import { resolveChfAmounts, resolveWalletPayoutDisplay, resolveWalletPayoutDisplays } from './currency-display.service';

export const resolveChfAmountsAction = async (input: unknown) => {
	const parsed = chfAmountsDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid currency display input');
	}

	return resolveChfAmounts(parsed.data);
};

export const resolveWalletPayoutDisplayAction = async (input: unknown) => {
	const parsed = walletPayoutDisplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplay(parsed.data);
};

export const resolveWalletPayoutDisplaysAction = async (input: unknown) => {
	const parsed = walletPayoutDisplayInputsSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid wallet payout display input');
	}

	return resolveWalletPayoutDisplays(parsed.data);
};
