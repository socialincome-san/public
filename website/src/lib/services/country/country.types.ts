export type CountryTableViewRow = {
	id: string;
	name: string;
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
	name: string;
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
	name: string;
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
	name?: string;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
	paymentProviders?: string[];
	sanctions?: string[];
	microfinanceSourceLink?: { text: string; href: string } | null;
	networkSourceLink?: { text: string; href: string } | null;
};
