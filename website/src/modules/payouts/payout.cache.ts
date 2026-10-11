import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './payout.service';
import { PAYOUT_CACHE_TAG, type CountryPayoutTotals } from './payout.types';

export const getPayoutTotalsForCountry = async (isoCode: string): Promise<Result<CountryPayoutTotals>> => {
	'use cache';
	cacheTag(PAYOUT_CACHE_TAG);

	return cacheResult(service.getPayoutTotalsForCountry(isoCode));
};

export const getPayoutTotalsForLocalPartnerSlug = async (localPartnerSlug: string): Promise<Result<CountryPayoutTotals>> => {
	'use cache';
	cacheTag(PAYOUT_CACHE_TAG);

	return cacheResult(service.getPayoutTotalsForLocalPartnerSlug(localPartnerSlug));
};
