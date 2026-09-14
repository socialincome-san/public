import type { CountryCode } from '@/generated/prisma/enums';
import { DateTime } from 'luxon';
import type { BankAccountLatestReserve } from '../reserves/reserve.types';

export type TransparencyFinancialPeriod = { kind: 'all-time' } | { kind: 'ytd' } | { kind: 'year'; year: number };

export type TransparencyFinancialPeriodRange = {
	start: DateTime;
	end: DateTime;
};

export const getTransparencyFinancialPeriodRange = (
	period: TransparencyFinancialPeriod,
	referenceDate = DateTime.now(),
): TransparencyFinancialPeriodRange | undefined => {
	if (period.kind === 'all-time') {
		return undefined;
	}

	const start = referenceDate.set({ year: period.kind === 'year' ? period.year : referenceDate.year }).startOf('year');

	return {
		start,
		end: period.kind === 'year' ? start.plus({ years: 1 }) : referenceDate,
	};
};

export const getTransparencyFinancialPeriodDateFilter = (
	period: TransparencyFinancialPeriod,
	referenceDate = DateTime.now(),
): { gte: Date; lt: Date } | undefined => {
	const periodRange = getTransparencyFinancialPeriodRange(period, referenceDate);
	if (!periodRange) {
		return undefined;
	}

	return {
		gte: periodRange.start.toJSDate(),
		lt: periodRange.end.toJSDate(),
	};
};

export const OTHER_COUNTRY_SEGMENT_CODE = 'OTHER';

export type TransparencyCountrySegmentCode = CountryCode | typeof OTHER_COUNTRY_SEGMENT_CODE;

export type CountryContributionRow = {
	countryCode: CountryCode;
	totalChf: number;
	contributorCount: number;
};

export type TransparencyCountrySegment = {
	countryCode: TransparencyCountrySegmentCode;
	totalChf: number;
	percentageOfTotal: number;
	unitCount: number;
	color: string;
};

type TransparencyOtherCountry = {
	countryCode: CountryCode;
	totalChf: number;
};

export type TransparencyCountriesData = {
	totalContributionsChf: number;
	countriesCount: number;
	segments: TransparencyCountrySegment[];
	otherCountries: TransparencyOtherCountry[];
};

export type CountryTransparencyTotals = {
	totalContributionsChf: number;
};

type TransparencyFinancialSummary = {
	inflowsChf: number;
	outflowsChf: number;
	reservesChf: number;
};

export type TransparencySummaryData = {
	financialSummary: TransparencyFinancialSummary;
	reserveAccounts: BankAccountLatestReserve[];
};

const ZEWO_RESERVE_RUNWAY_MIN_MONTHS = 3;
const ZEWO_RESERVE_RUNWAY_MAX_MONTHS = 18;

export const isRunwayInLineWithZewo = (months: number): boolean =>
	months >= ZEWO_RESERVE_RUNWAY_MIN_MONTHS && months <= ZEWO_RESERVE_RUNWAY_MAX_MONTHS;
