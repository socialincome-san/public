import { CountryCreateInput, CountryPayload, CountryUpdateInput } from '@/lib/services/country/country.types';
import { CountryFormSchema } from './countries-form';

export const buildCreateCountryInput = (schema: CountryFormSchema): CountryCreateInput => {
	return {
		isoCode: schema.fields.isoCode.value,
		isActive: schema.fields.isActive.value,
		microfinanceIndex: schema.fields.microfinanceIndex.value ?? null,
		populationCoverage: schema.fields.populationCoverage.value ?? null,
		latestSurveyDate: schema.fields.latestSurveyDate.value ?? null,
		networkTechnology: schema.fields.networkTechnology.value ?? null,
		paymentProviders: schema.fields.paymentProviders.value ?? [],
		sanctions: schema.fields.sanctions.value ?? [],
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

export const buildUpdateCountryInput = (schema: CountryFormSchema, existing: CountryPayload): CountryUpdateInput => {
	return {
		id: existing.id,
		isoCode: schema.fields.isoCode.value,
		isActive: schema.fields.isActive.value,
		microfinanceIndex: schema.fields.microfinanceIndex.value ?? null,
		populationCoverage: schema.fields.populationCoverage.value ?? null,
		latestSurveyDate: schema.fields.latestSurveyDate.value ?? null,
		networkTechnology: schema.fields.networkTechnology.value ?? null,
		paymentProviders: schema.fields.paymentProviders.value ?? [],
		sanctions: schema.fields.sanctions.value ?? [],
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
