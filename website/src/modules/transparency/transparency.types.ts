import type { CountryCode } from '@/generated/prisma/enums';
import type { BankAccountLatestReserve } from '@/modules/reserves/reserve.types';

export type TransparencyFinancialPeriod = { kind: 'all-time' } | { kind: 'ytd' } | { kind: 'year'; year: number };

export type CountryContributionRow = {
	countryCode: CountryCode;
	totalChf: number;
	contributorCount: number;
};

export type TransparencyCountrySegmentCode = CountryCode | 'OTHER';

export type TransparencyCountrySegment = {
	countryCode: TransparencyCountrySegmentCode;
	totalChf: number;
	percentageOfTotal: number;
	unitCount: number;
	color: string;
};

export type TransparencyCountriesData = {
	totalContributionsChf: number;
	countriesCount: number;
	segments: TransparencyCountrySegment[];
	otherCountries: {
		countryCode: CountryCode;
		totalChf: number;
	}[];
};

export type TransparencySummaryData = {
	financialSummary: {
		inflowsChf: number;
		outflowsChf: number;
		reservesChf: number;
	};
	reserveAccounts: BankAccountLatestReserve[];
};
