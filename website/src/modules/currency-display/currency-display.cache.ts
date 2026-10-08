import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './currency-display.service';
import {
	CURRENCY_DISPLAY_CACHE_TAG,
	type ChfAmountsDisplayInput,
	type DisplayAmountsByCurrency,
	type WalletPayoutDisplayInput,
} from './currency-display.types';

export const resolveChfAmounts = async (input: ChfAmountsDisplayInput): Promise<Result<DisplayAmountsByCurrency>> => {
	'use cache';
	cacheTag(CURRENCY_DISPLAY_CACHE_TAG);

	return cacheResult(service.resolveChfAmounts(input));
};

export const resolveWalletPayoutDisplays = async (
	inputs: WalletPayoutDisplayInput[],
): Promise<Result<DisplayAmountsByCurrency>> => {
	'use cache';
	cacheTag(CURRENCY_DISPLAY_CACHE_TAG);

	return cacheResult(service.resolveWalletPayoutDisplays(inputs));
};
