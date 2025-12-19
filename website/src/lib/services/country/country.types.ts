export type CountryTableViewRow = {
	id: string;
	name: string;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
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
};

export type CountryCreateInput = {
	name: string;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
};

export type CountryUpdateInput = {
	id: string;
	name?: string;
	microfinanceIndex?: number | null;
	populationCoverage?: number | null;
	networkTechnology?: string | null;
	latestSurveyDate?: Date | null;
};
