import { CountryCreateInput, CountryPayload, CountryUpdateInput } from '@/lib/services/country/country.types';
import { CountryFormSchema } from './countries-form';

export function buildCreateCountryInput(schema: CountryFormSchema): CountryCreateInput {
	return {
		name: schema.fields.name.value,
		microfinanceIndex: schema.fields.microfinanceIndex.value ?? null,
		populationCoverage: schema.fields.populationCoverage.value ?? null,
		latestSurveyDate: schema.fields.latestSurveyDate.value ?? null,
		networkTechnology: schema.fields.networkTechnology.value ?? null,
		microfinanceSourceLink:
			schema.fields.microfinanceSourceText.value || schema.fields.microfinanceSourceHref.value
				? {
					text: schema.fields.microfinanceSourceText.value ?? '',
					href: schema.fields.microfinanceSourceHref.value ?? '',
				}
				: null,
		networkSourceLink:
			schema.fields.networkSourceText.value || schema.fields.networkSourceHref.value
				? {
					text: schema.fields.networkSourceText.value ?? '',
					href: schema.fields.networkSourceHref.value ?? '',
				}
				: null,
	};
}

export function buildUpdateCountryInput(schema: CountryFormSchema, existing: CountryPayload): CountryUpdateInput {
	return {
		id: existing.id,
		name: schema.fields.name.value,
		microfinanceIndex: schema.fields.microfinanceIndex.value ?? null,
		populationCoverage: schema.fields.populationCoverage.value ?? null,
		latestSurveyDate: schema.fields.latestSurveyDate.value ?? null,
		networkTechnology: schema.fields.networkTechnology.value ?? null,
		microfinanceSourceLink:
			schema.fields.microfinanceSourceText.value || schema.fields.microfinanceSourceHref.value
				? {
					text: schema.fields.microfinanceSourceText.value ?? '',
					href: schema.fields.microfinanceSourceHref.value ?? '',
				}
				: null,
		networkSourceLink:
			schema.fields.networkSourceText.value || schema.fields.networkSourceHref.value
				? {
					text: schema.fields.networkSourceText.value ?? '',
					href: schema.fields.networkSourceHref.value ?? '',
				}
				: null,
	};
}
