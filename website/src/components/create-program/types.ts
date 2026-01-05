export enum CountryCondition {
	MET = 'met',
	NOT_MET = 'not_met',
	RESTRICTIONS_APPLY = 'restrictions_apply',
}

export type CountryConditionSource = {
	text: string;
	href?: string;
};

export type CountryCriterion = {
	condition: CountryCondition;
	details: {
		text: string;
		source?: CountryConditionSource;
	};
};

export type CountryTableRow = {
	id: string;

	country: {
		name: string;
		// TODO: add countryFlag later (ISO code or image src)
	};

	cash: CountryCriterion;
	mobileMoney: CountryCriterion;
	mobileNetwork: CountryCriterion;
	sanctions: CountryCriterion;
};
