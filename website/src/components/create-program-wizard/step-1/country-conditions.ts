import { CountryCondition, type CountryEligibilityRow } from '@/modules/countries/country.types';

export const COUNTRY_CONDITION_KEYS = ['cash', 'mobileMoney', 'mobileNetwork', 'sanctions'] as const;

export const meetsAllConditions = (row: CountryEligibilityRow) =>
	COUNTRY_CONDITION_KEYS.every((key) => row[key].condition === CountryCondition.MET);
