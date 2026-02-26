import { CountryCreateInput, CountryPayload, CountryUpdateInput } from '@/lib/services/country/country.types';
import { CountryFormSchema } from './countries-form';

export const buildCreateCountryInput = (schema: CountryFormSchema): CountryCreateInput => {
	const cash = schema.fields.suitabilityOfCash.fields;
	const mobileMoney = schema.fields.mobileMoney.fields;
	const mobileNetwork = schema.fields.mobileNetwork.fields;
	const sanctions = schema.fields.noSanctions.fields;

	return {
		isoCode: schema.fields.isoCode.value,
		isActive: schema.fields.isActive.value,
		microfinanceIndex: cash.microfinanceIndex.value ?? null,
		populationCoverage: mobileNetwork.populationCoverage.value ?? null,
		latestSurveyDate: cash.latestSurveyDate.value ?? null,
		networkTechnology: mobileNetwork.networkTechnology.value ?? null,
		mobileMoneyProviderIds: mobileMoney.mobileMoneyProviders.value ?? [],
		sanctions: sanctions.sanctions.value ?? [],
		microfinanceSourceLink:
			cash.microfinanceSourceText.value || cash.microfinanceSourceHref.value
				? {
						text: cash.microfinanceSourceText.value ?? '',
						href: cash.microfinanceSourceHref.value ?? '',
					}
				: null,
		networkSourceLink:
			mobileNetwork.networkSourceText.value || mobileNetwork.networkSourceHref.value
				? {
						text: mobileNetwork.networkSourceText.value ?? '',
						href: mobileNetwork.networkSourceHref.value ?? '',
					}
				: null,
	};
};

export const buildUpdateCountryInput = (schema: CountryFormSchema, existing: CountryPayload): CountryUpdateInput => {
	const cash = schema.fields.suitabilityOfCash.fields;
	const mobileMoney = schema.fields.mobileMoney.fields;
	const mobileNetwork = schema.fields.mobileNetwork.fields;
	const sanctions = schema.fields.noSanctions.fields;

	return {
		id: existing.id,
		isoCode: schema.fields.isoCode.value,
		isActive: schema.fields.isActive.value,
		microfinanceIndex: cash.microfinanceIndex.value ?? null,
		populationCoverage: mobileNetwork.populationCoverage.value ?? null,
		latestSurveyDate: cash.latestSurveyDate.value ?? null,
		networkTechnology: mobileNetwork.networkTechnology.value ?? null,
		mobileMoneyProviderIds: mobileMoney.mobileMoneyProviders.value ?? [],
		sanctions: sanctions.sanctions.value ?? [],
		microfinanceSourceLink:
			cash.microfinanceSourceText.value || cash.microfinanceSourceHref.value
				? {
						text: cash.microfinanceSourceText.value ?? '',
						href: cash.microfinanceSourceHref.value ?? '',
					}
				: null,
		networkSourceLink:
			mobileNetwork.networkSourceText.value || mobileNetwork.networkSourceHref.value
				? {
						text: mobileNetwork.networkSourceText.value ?? '',
						href: mobileNetwork.networkSourceHref.value ?? '',
					}
				: null,
	};
};
