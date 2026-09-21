import type { CountryCode, Currency, NetworkTechnology, SanctionRegime } from '@/generated/prisma/enums';

export type MobileMoneyProviderRef = {
	id: string;
	name: string;
};

export type CountryTableViewRow = {
	id: string;
	isoCode: CountryCode;
	isActive: boolean;
	currency?: Currency | null;
	defaultPayoutAmount?: number | null;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	mobileMoneyProviders?: MobileMoneyProviderRef[] | null;
	sanctions?: string[] | null;
	microfinanceSourceText?: string | null;
	microfinanceSourceHref?: string | null;
	networkSourceText?: string | null;
	networkSourceHref?: string | null;
	updatedAt: Date;
};

export type CountryTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type CountryPaginatedTableView = {
	tableRows: CountryTableViewRow[];
	totalCount: number;
};

export type CountryPayload = {
	id: string;
	isoCode: CountryCode;
	isActive: boolean;
	currency: Currency;
	defaultPayoutAmount: number;
	microfinanceIndex?: number | null;
	cashConditionOverride: boolean;
	populationCoverage?: number | null;
	networkTechnology?: NetworkTechnology | null;
	latestSurveyDate?: Date | null;
	mobileMoneyProviders?: MobileMoneyProviderRef[] | null;
	mobileMoneyConditionOverride: boolean;
	sanctions?: SanctionRegime[] | null;
	microfinanceSourceLink?: { id: string; text: string; href: string } | null;
	networkSourceLink?: { id: string; text: string; href: string } | null;
};

export enum CountryCondition {
	MET = 'met',
	NOT_MET = 'not_met',
	RESTRICTIONS_APPLY = 'restrictions_apply',
}

type CountryConditionSource = {
	translationKey?: string;
	translationContext?: Record<string, string | number>;
	text?: string;
	href?: string;
};

type CountryFeasibility = {
	condition: CountryCondition;
	details: {
		translationKey: string;
		translationContext?: Record<string, string | number>;
		source?: CountryConditionSource;
	};
};

export type ProgramCountryFeasibilityRow = {
	id: string;
	country: {
		isoCode: CountryCode;
		isActive: boolean;
		currency: Currency;
		defaultPayoutAmount: number;
	};
	stats: {
		programCount: number;
		recipientCount: number;
		candidateCount: number;
	};
	cash: CountryFeasibility;
	mobileMoney: CountryFeasibility;
	mobileNetwork: CountryFeasibility;
	sanctions: CountryFeasibility;
};

export type ProgramCountryFeasibilityView = {
	rows: ProgramCountryFeasibilityRow[];
};

export type PublicCountryStats = {
	programsCount: number;
	recipientsCount: number;
};

export type PublicCountryStatsMap = Record<string, PublicCountryStats>;

export type CountryStatisticFormat = 'number' | 'percentage' | 'years';

export type CountryStatisticRow = {
	key: 'population' | 'growthRate' | 'literacyRate' | 'povertyLevel' | 'lifeExpectancy';
	labelKey:
		| 'countries-page.statistics.population'
		| 'countries-page.statistics.growth-rate'
		| 'countries-page.statistics.literacy-rate'
		| 'countries-page.statistics.poverty-level'
		| 'countries-page.statistics.life-expectancy';
	format: CountryStatisticFormat;
	countryValue: number;
	visitorValue: number;
};

export const NETWORK_TECH_LABELS: Record<NetworkTechnology, string> = {
	g3: '3G',
	g4: '4G',
	g5: '5G',
	satellite: 'Satellite',
	unknown: 'Unknown',
};
