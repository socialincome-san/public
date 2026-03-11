import { CountryFormCreateInput, CountryFormUpdateInput } from '@/lib/services/country/country-form-input';
import { CountryPayload } from '@/lib/services/country/country.types';
import { CountryFormSchema } from './countries-form';

export const buildCreateCountryInput = (schema: CountryFormSchema): CountryFormCreateInput => {
	const countrySettings = schema.fields.countrySettings.fields;
	const cash = schema.fields.suitabilityOfCash.fields;
	const mobileMoney = schema.fields.mobileMoney.fields;
	const mobileNetwork = schema.fields.mobileNetwork.fields;
	const sanctions = schema.fields.noSanctions.fields;

	return {
		isoCode: countrySettings.isoCode.value,
		isActive: countrySettings.isActive.value,
		currency: countrySettings.currency.value,
		defaultPayoutAmount: countrySettings.defaultPayoutAmount.value,
		microfinanceIndex: cash.microfinanceIndex.value ?? null,
		cashConditionOverride: cash.cashConditionOverride.value ?? false,
		populationCoverage: mobileNetwork.populationCoverage.value ?? null,
		latestSurveyDate: cash.latestSurveyDate.value ?? null,
		networkTechnology: mobileNetwork.networkTechnology.value ?? null,
		mobileMoneyProviderIds: mobileMoney.mobileMoneyProviders.value ?? [],
		mobileMoneyConditionOverride: mobileMoney.mobileMoneyConditionOverride.value ?? false,
		sanctions: sanctions.sanctions.value ?? [],
		microfinanceSourceLink: buildOptionalSourceLink(cash.microfinanceSourceText.value, cash.microfinanceSourceHref.value),
		networkSourceLink: buildOptionalSourceLink(mobileNetwork.networkSourceText.value, mobileNetwork.networkSourceHref.value),
	};
};

export const buildUpdateCountryInput = (schema: CountryFormSchema, existing: CountryPayload): CountryFormUpdateInput => {
	const countrySettings = schema.fields.countrySettings.fields;
	const cash = schema.fields.suitabilityOfCash.fields;
	const mobileMoney = schema.fields.mobileMoney.fields;
	const mobileNetwork = schema.fields.mobileNetwork.fields;
	const sanctions = schema.fields.noSanctions.fields;

	return {
		id: existing.id,
		isoCode: countrySettings.isoCode.value,
		isActive: countrySettings.isActive.value,
		currency: countrySettings.currency.value,
		defaultPayoutAmount: countrySettings.defaultPayoutAmount.value,
		microfinanceIndex: cash.microfinanceIndex.value ?? null,
		cashConditionOverride: cash.cashConditionOverride.value ?? false,
		populationCoverage: mobileNetwork.populationCoverage.value ?? null,
		latestSurveyDate: cash.latestSurveyDate.value ?? null,
		networkTechnology: mobileNetwork.networkTechnology.value ?? null,
		mobileMoneyProviderIds: mobileMoney.mobileMoneyProviders.value ?? [],
		mobileMoneyConditionOverride: mobileMoney.mobileMoneyConditionOverride.value ?? false,
		sanctions: sanctions.sanctions.value ?? [],
		microfinanceSourceLink: buildOptionalSourceLink(cash.microfinanceSourceText.value, cash.microfinanceSourceHref.value),
		networkSourceLink: buildOptionalSourceLink(mobileNetwork.networkSourceText.value, mobileNetwork.networkSourceHref.value),
	};
};

const buildOptionalSourceLink = (rawText: unknown, rawHref: unknown): { text: string; href: string } | null => {
	const text = typeof rawText === 'string' ? rawText.trim() : '';
	const href = typeof rawHref === 'string' ? rawHref.trim() : '';

	if (!text || !href) {
		return null;
	}

	return { text, href };
};
