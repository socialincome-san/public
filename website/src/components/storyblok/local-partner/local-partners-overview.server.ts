import { getCountryNameFromIsoCode } from '@/lib/types/country';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { LocalPartnerStory } from './local-partner.types';
import {
	getLocalPartnerDescription,
	getLocalPartnerIsoCode,
	getLocalPartnerSlug,
	getLocalPartnerTitle,
} from './local-partner.utils';
import { COUNTRY_QUERY_KEY, SEARCH_QUERY_KEY } from './local-partners-overview-query';

export type FilterOption = {
	value: string;
	label: string;
};

const getQueryValue = (searchParams: AnySearchParams | undefined, key: string) => {
	const value = searchParams?.[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

export const getSearchQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, SEARCH_QUERY_KEY);
};

export const getCountryQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, COUNTRY_QUERY_KEY).toUpperCase();
};

const normalizeSearchValue = (value: string) => value.toLowerCase();

const getNormalizedIsoCode = (localPartner: LocalPartnerStory) =>
	getLocalPartnerIsoCode(localPartner.content)?.toUpperCase();

export const localPartnerMatchesSearchQuery = (localPartner: LocalPartnerStory, searchQuery: string) => {
	const keywords = [
		getLocalPartnerTitle(localPartner.content),
		getLocalPartnerSlug(localPartner),
		getLocalPartnerDescription(localPartner.content),
	]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/);

	return searchTerms.every((term) => keywords.includes(term));
};

export const localPartnerMatchesCountryQuery = (
	localPartner: LocalPartnerStory,
	selectedCountryIsoCode: string | undefined,
) => {
	if (!selectedCountryIsoCode) {
		return true;
	}

	return getNormalizedIsoCode(localPartner) === selectedCountryIsoCode;
};

export const getCountryFilterOptions = (localPartners: LocalPartnerStory[]): FilterOption[] => {
	const optionsByCountryIsoCode = new Map<string, FilterOption>();

	localPartners.forEach((localPartner) => {
		const countryIsoCode = getNormalizedIsoCode(localPartner);

		if (countryIsoCode) {
			optionsByCountryIsoCode.set(countryIsoCode, {
				value: countryIsoCode,
				label: getCountryNameFromIsoCode(countryIsoCode),
			});
		}
	});

	return [...optionsByCountryIsoCode.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};
