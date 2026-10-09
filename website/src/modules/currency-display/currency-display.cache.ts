import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './currency-display.service';
import {
	CURRENCY_DISPLAY_CACHE_TAG,
	type ChfAmountsDisplayInput,
	type DisplayAmount,
	type WalletPayoutDisplaysInput,
} from './currency-display.types';

export const resolveChfAmounts = async (input: ChfAmountsDisplayInput): Promise<Result<DisplayAmount[]>> => {
	'use cache';
	cacheTag(CURRENCY_DISPLAY_CACHE_TAG);

	return cacheResult(service.resolveChfAmounts(input));
};

export const resolveWalletPayoutDisplays = async (input: WalletPayoutDisplaysInput): Promise<Result<DisplayAmount[]>> => {
	'use cache';
	cacheTag(CURRENCY_DISPLAY_CACHE_TAG);

	return cacheResult(service.resolveWalletPayoutDisplays(input));
};
