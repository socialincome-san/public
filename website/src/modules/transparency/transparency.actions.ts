'use server';

import { resultFail } from '@/lib/service-result';
import { transparencyCountriesInputSchema } from './transparency.schemas';
import {
	getContributionsByCountryData,
	getRunwayMonths,
	getTotalContributionsChf,
	getTransparencySummary,
} from './transparency.service';

export const getTotalContributionsChfAction = async () => getTotalContributionsChf();

export const getTransparencySummaryAction = async () => getTransparencySummary();

export const getRunwayMonthsAction = async () => getRunwayMonths();

export const getContributionsByCountryDataAction = async (input: unknown) => {
	const result = transparencyCountriesInputSchema.safeParse(input);
	if (!result.success) {
		return resultFail('Invalid transparency countries input');
	}

	return getContributionsByCountryData(result.data.limit, result.data.financialPeriod);
};
