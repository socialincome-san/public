import { NetworkTechnology, PaymentProvider } from '@/generated/prisma/client';

export type CountryTableViewRow = {
	id: string;
	isoCode: string;
	isActive: boolean;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	paymentProviders?: string[] | null;
	sanctions?: string[] | null;
	microfinanceSourceText?: string | null;
	microfinanceSourceHref?: string | null;
	networkSourceText?: string | null;
	networkSourceHref?: string | null;
	createdAt: Date;
};

export type CountryTableView = {
	tableRows: CountryTableViewRow[];
};

export type CountryPayload = {
	id: string;
	isoCode: string;
	isActive: boolean;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	paymentProviders?: string[] | null;
	sanctions?: string[] | null;
	microfinanceSourceLink?: { id: string; text: string; href: string } | null;
	networkSourceLink?: { id: string; text: string; href: string } | null;
};

export type CountryCreateInput = {
	isoCode: string;
	isActive: boolean;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	paymentProviders?: string[];
	sanctions?: string[];
	microfinanceSourceLink?: { text: string; href: string } | null;
	networkSourceLink?: { text: string; href: string } | null;
};

export type CountryUpdateInput = {
	id: string;
	isoCode?: string;
	isActive?: boolean;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	paymentProviders?: string[];
	sanctions?: string[];
	microfinanceSourceLink?: { text: string; href: string } | null;
	networkSourceLink?: { text: string; href: string } | null;
};

export enum CountryCondition {
	MET = 'met',
	NOT_MET = 'not_met',
	RESTRICTIONS_APPLY = 'restrictions_apply',
}

type CountryConditionSource = {
	text: string;
	href?: string;
};

type CountryFeasibility = {
	condition: CountryCondition;
	details: {
		text: string;
		source?: CountryConditionSource;
	};
};

export type ProgramCountryFeasibilityRow = {
	id: string;

	country: {
		isoCode: string;
		isActive: boolean;
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

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
	[PaymentProvider.orange_money]: 'Orange Money',
};
