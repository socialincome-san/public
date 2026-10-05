'use server';

import { resultFail, type Result } from '@/lib/result';
import type { TransparencyCountriesData, TransparencySummaryData } from '@/modules/transparency/transparency.types';
import { transparencyCountriesInputSchema } from './transparency.schemas';
import {
	getContributionsByCountryData,
	getRunwayMonths,
	getTotalContributionsChf,
	getTransparencySummary,
} from './transparency.service';

export const getTotalContributionsChfAction = async (): Promise<Result<number>> => getTotalContributionsChf();

export const getTransparencySummaryAction = async (): Promise<Result<TransparencySummaryData>> => getTransparencySummary();

export const getRunwayMonthsAction = async (): Promise<Result<number>> => getRunwayMonths();

export const getContributionsByCountryDataAction = async (input: unknown): Promise<Result<TransparencyCountriesData>> => {
	const result = transparencyCountriesInputSchema.safeParse(input);
	if (!result.success) {
		return resultFail('Invalid transparency countries input');
	}

	return getContributionsByCountryData(result.data.limit, result.data.financialPeriod);
};
