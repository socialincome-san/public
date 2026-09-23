import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { assignFlagColors } from '@/lib/utils/country-flag-color';
import { getCountryFlagColors } from '@/lib/utils/country-flag-colors';
import {
	getSucceededContributionsByContributorCountry,
	getSucceededContributionTotal,
} from '@/modules/contributions/contribution.service';
import { getPaidOrConfirmedPayoutTotal } from '@/modules/payouts/payout.service';
import { getLatestReserves } from '@/modules/reserves/reserve.service';
import { startOfMonth, subMonths } from 'date-fns';
import { DateTime } from 'luxon';
import type {
	CountryContributionRow,
	TransparencyCountriesData,
	TransparencyCountrySegment,
	TransparencyCountrySegmentCode,
	TransparencyFinancialPeriod,
	TransparencySummaryData,
} from './transparency.types';

const TOP_CONTRIBUTING_COUNTRIES_LIMIT = 15;
const COUNTRY_DISTRIBUTION_UNIT_COUNT = 100;
const OTHER_COUNTRY_SEGMENT_CODE = 'OTHER';
const OTHER_SEGMENT_COLOR = 'hsl(var(--muted-foreground) / 0.4)';

export const getTotalContributionsChf = async (
	financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
): Promise<ServiceResult<number>> => {
	try {
		const result = await getSucceededContributionTotal(getFinancialPeriodDateRange(financialPeriod));

		return result.success ? resultOk(result.data) : resultFail(result.error);
	} catch (error) {
		console.error('Could not fetch total contributions', { error });

		return resultFail('Could not fetch total contributions');
	}
};

export const getTransparencySummary = async (
	financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
): Promise<ServiceResult<TransparencySummaryData>> => {
	try {
		const dateRange = getFinancialPeriodDateRange(financialPeriod);
		const [inflowsResult, outflowsResult, latestReservesResult] = await Promise.all([
			getSucceededContributionTotal(dateRange),
			getPaidOrConfirmedPayoutTotal(dateRange),
			getLatestReserves(),
		]);
		if (!inflowsResult.success) {
			return resultFail(inflowsResult.error);
		}
		if (!outflowsResult.success) {
			return resultFail(outflowsResult.error);
		}
		if (!latestReservesResult.success) {
			return resultFail(latestReservesResult.error);
		}

		return resultOk({
			financialSummary: {
				inflowsChf: inflowsResult.data,
				outflowsChf: outflowsResult.data,
				reservesChf: latestReservesResult.data.total,
			},
			reserveAccounts: latestReservesResult.data.accounts,
		});
	} catch (error) {
		console.error('Could not fetch transparency summary', { error });

		return resultFail('Could not fetch transparency summary');
	}
};

export const getRunwayMonths = async (): Promise<ServiceResult<number>> => {
	try {
		const latestReservesResult = await getLatestReserves();
		if (!latestReservesResult.success) {
			return resultFail(latestReservesResult.error);
		}

		const referenceDate = getLatestReserveRecordedAt(latestReservesResult.data.accounts) ?? new Date();
		const monthlyPaymentsResult = await getPaidOrConfirmedPayoutTotal({
			gte: startOfMonth(subMonths(referenceDate, 1)),
			lt: startOfMonth(referenceDate),
		});
		if (!monthlyPaymentsResult.success) {
			return resultFail(monthlyPaymentsResult.error);
		}
		if (monthlyPaymentsResult.data <= 0) {
			return resultFail('No recipient payments in the last completed month');
		}

		return resultOk(Math.floor(latestReservesResult.data.total / monthlyPaymentsResult.data));
	} catch (error) {
		console.error('Could not calculate runway months', { error });

		return resultFail('Could not calculate runway months');
	}
};

export const getContributionsByCountryData = async (
	limit: number = TOP_CONTRIBUTING_COUNTRIES_LIMIT,
	financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' },
): Promise<ServiceResult<TransparencyCountriesData>> => {
	try {
		const rowsResult = await getSucceededContributionsByContributorCountry(getFinancialPeriodDateRange(financialPeriod));
		if (!rowsResult.success) {
			return resultFail(rowsResult.error);
		}

		return resultOk(buildTransparencyCountriesData(rowsResult.data, limit));
	} catch (error) {
		console.error('Could not fetch contributions by country', { error });

		return resultFail('Could not fetch contributions by country');
	}
};

const getFinancialPeriodDateRange = (
	period: TransparencyFinancialPeriod,
	referenceDate = DateTime.now(),
): { gte: Date; lt: Date } | undefined => {
	if (period.kind === 'all-time') {
		return undefined;
	}

	const start = referenceDate.set({ year: period.kind === 'year' ? period.year : referenceDate.year }).startOf('year');

	return {
		gte: start.toJSDate(),
		lt: period.kind === 'year' ? start.plus({ years: 1 }).toJSDate() : referenceDate.toJSDate(),
	};
};

const getLatestReserveRecordedAt = (accounts: { recordedAt: Date | null }[]): Date | undefined =>
	accounts.reduce<Date | undefined>((latest, { recordedAt }) => {
		if (!recordedAt) {
			return latest;
		}

		return latest && latest > recordedAt ? latest : recordedAt;
	}, undefined);

const compareCountryContributionRows = (left: CountryContributionRow, right: CountryContributionRow): number =>
	right.totalChf - left.totalChf || left.countryCode.localeCompare(right.countryCode);

const allocateUnitCounts = (weights: number[], totalUnits = COUNTRY_DISTRIBUTION_UNIT_COUNT): number[] => {
	if (weights.length === 0) {
		return [];
	}

	const sum = weights.reduce((total, weight) => total + weight, 0);
	if (sum <= 0) {
		return weights.map(() => 0);
	}

	const exactShares = weights.map((weight) => (weight / sum) * totalUnits);
	const unitCounts = exactShares.map(Math.floor);
	let remainder = totalUnits - unitCounts.reduce((total, count) => total + count, 0);
	const remainderOrder = exactShares
		.map((share, index) => ({ index, fraction: share - (unitCounts[index] ?? 0) }))
		.sort((left, right) => right.fraction - left.fraction || left.index - right.index);

	for (const { index } of remainderOrder) {
		if (remainder <= 0) {
			break;
		}
		unitCounts[index] = (unitCounts[index] ?? 0) + 1;
		remainder -= 1;
	}

	for (const [index, weight] of weights.entries()) {
		if (weight <= 0 || (unitCounts[index] ?? 0) > 0) {
			continue;
		}

		const donorIndex = unitCounts.reduce(
			(largestIndex, count, candidateIndex) => (count > (unitCounts[largestIndex] ?? 0) ? candidateIndex : largestIndex),
			0,
		);
		if ((unitCounts[donorIndex] ?? 0) <= 1) {
			break;
		}

		unitCounts[donorIndex] = (unitCounts[donorIndex] ?? 0) - 1;
		unitCounts[index] = 1;
	}

	return unitCounts;
};

const buildTransparencyCountriesData = (
	rows: CountryContributionRow[],
	requestedLimit: number,
): TransparencyCountriesData => {
	const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.floor(requestedLimit)) : TOP_CONTRIBUTING_COUNTRIES_LIMIT;
	const countries = [...rows].filter((row) => row.totalChf > 0).sort(compareCountryContributionRows);
	const totalContributionsChf = countries.reduce((sum, row) => sum + row.totalChf, 0);
	if (countries.length === 0 || totalContributionsChf <= 0) {
		return {
			totalContributionsChf: 0,
			countriesCount: 0,
			segments: [],
			otherCountries: [],
		};
	}

	const topCountries = countries.slice(0, limit);
	const otherCountries = countries.slice(limit);
	const unresolvedSegments: {
		countryCode: TransparencyCountrySegmentCode;
		totalChf: number;
	}[] = topCountries.map(({ countryCode, totalChf }) => ({ countryCode, totalChf }));
	if (otherCountries.length > 0) {
		unresolvedSegments.push({
			countryCode: OTHER_COUNTRY_SEGMENT_CODE,
			totalChf: otherCountries.reduce((sum, row) => sum + row.totalChf, 0),
		});
	}

	const unitCounts = allocateUnitCounts(unresolvedSegments.map(({ totalChf }) => totalChf));
	const countryColorByCode = assignFlagColors(
		unresolvedSegments.flatMap(({ countryCode }) => (countryCode === OTHER_COUNTRY_SEGMENT_CODE ? [] : [countryCode])),
		getCountryFlagColors,
	);
	const segments: TransparencyCountrySegment[] = unresolvedSegments.map((segment, index) => ({
		countryCode: segment.countryCode,
		totalChf: segment.totalChf,
		percentageOfTotal: (segment.totalChf / totalContributionsChf) * 100,
		unitCount: unitCounts[index] ?? 0,
		color:
			segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE
				? OTHER_SEGMENT_COLOR
				: (countryColorByCode.get(segment.countryCode) ?? OTHER_SEGMENT_COLOR),
	}));

	return {
		totalContributionsChf,
		countriesCount: countries.length,
		segments,
		otherCountries: otherCountries.map(({ countryCode, totalChf }) => ({ countryCode, totalChf })),
	};
};
