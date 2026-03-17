import { Currency, MobileMoneyProvider } from '@/generated/prisma/client';
import { CountryCode, NetworkTechnology } from '@/generated/prisma/enums';

export type MobileMoneyProviderRef = Pick<MobileMoneyProvider, 'id' | 'name'>;

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

export type CountryTableView = {
	tableRows: CountryTableViewRow[];
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
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	mobileMoneyProviders?: MobileMoneyProviderRef[] | null;
	mobileMoneyConditionOverride: boolean;
	sanctions?: string[] | null;
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
	};

	cash: CountryFeasibility;
	mobileMoney: CountryFeasibility;
	mobileNetwork: CountryFeasibility;
	sanctions: CountryFeasibility;
};

export type ProgramCountryFeasibilityView = {
	rows: ProgramCountryFeasibilityRow[];
};

export const NETWORK_TECH_LABELS: Record<NetworkTechnology, string> = {
	[NetworkTechnology.g3]: '3G',
	[NetworkTechnology.g4]: '4G',
	[NetworkTechnology.g5]: '5G',
	[NetworkTechnology.satellite]: 'Satellite',
	[NetworkTechnology.unknown]: 'Unknown',
};
