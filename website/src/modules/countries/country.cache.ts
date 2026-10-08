import type { CountryCode } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './country.service';
import { COUNTRY_CACHE_TAG, type CountryStatisticRow, type PublicCountryStatsMap } from './country.types';

export const getPublicCountryStatsByIsoCodes = async (isoCodes: string[]): Promise<Result<PublicCountryStatsMap>> => {
	'use cache';
	cacheTag(COUNTRY_CACHE_TAG);

	return cacheResult(service.getPublicCountryStatsByIsoCodes(isoCodes));
};

export const getCountryStatisticsComparison = async (
	countryCode: CountryCode,
	visitorCountryCode: CountryCode,
): Promise<Result<CountryStatisticRow[]>> => {
	'use cache';
	cacheTag(COUNTRY_CACHE_TAG);

	return cacheResult(service.getCountryStatisticsComparison(countryCode, visitorCountryCode));
};
