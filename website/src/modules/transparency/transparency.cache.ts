import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './transparency.service';
import {
	TRANSPARENCY_CACHE_TAG,
	type TransparencyCountriesData,
	type TransparencyFinancialPeriod,
	type TransparencySummaryData,
} from './transparency.types';

export const getTotalContributionsChf = async (financialPeriod?: TransparencyFinancialPeriod): Promise<Result<number>> => {
	'use cache';
	cacheTag(TRANSPARENCY_CACHE_TAG);

	return cacheResult(service.getTotalContributionsChf(financialPeriod));
};

export const getTransparencySummary = async (
	financialPeriod?: TransparencyFinancialPeriod,
): Promise<Result<TransparencySummaryData>> => {
	'use cache';
	cacheTag(TRANSPARENCY_CACHE_TAG);

	return cacheResult(service.getTransparencySummary(financialPeriod));
};

export const getRunwayMonths = async (): Promise<Result<number>> => {
	'use cache';
	cacheTag(TRANSPARENCY_CACHE_TAG);

	return cacheResult(service.getRunwayMonths());
};

export const getContributionsByCountryData = async (
	limit?: number,
	financialPeriod?: TransparencyFinancialPeriod,
): Promise<Result<TransparencyCountriesData>> => {
	'use cache';
	cacheTag(TRANSPARENCY_CACHE_TAG);

	return cacheResult(service.getContributionsByCountryData(limit, financialPeriod));
};
