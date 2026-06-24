import type { PublicFocusStatsBySlugMap } from '@/lib/services/focus/focus.types';
import { getCountryNameByCode } from '@/lib/types/country';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusText, getFocusTitle } from './focus.utils';
import { COUNTRY_QUERY_KEY, SEARCH_QUERY_KEY } from './focuses-overview-query';

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
	return getQueryValue(searchParams, COUNTRY_QUERY_KEY);
};

const normalizeSearchValue = (value: string) => value.toLowerCase();

export const focusMatchesSearchQuery = (focus: FocusStory, searchQuery: string) => {
	const keywords = [getFocusTitle(focus.content), getFocusSlug(focus), focus.content.portalSlug, getFocusText(focus.content)]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/);

	return searchTerms.every((term) => keywords.includes(term));
};

export const focusMatchesCountryQuery = (
	focus: FocusStory,
	statsBySlug: PublicFocusStatsBySlugMap,
	selectedCountryIsoCode: string | undefined,
) => {
	if (!selectedCountryIsoCode) {
		return true;
	}

	const focusSlug = getFocusSlug(focus);

	return (
		statsBySlug[focusSlug]?.countryIsoCodes.some((countryIsoCode) => countryIsoCode === selectedCountryIsoCode) ?? false
	);
};

export const getCountryFilterOptions = (focuses: FocusStory[], statsBySlug: PublicFocusStatsBySlugMap): FilterOption[] => {
	const optionsByCountryIsoCode = new Map<string, FilterOption>();

	focuses.forEach((focus) => {
		const focusSlug = getFocusSlug(focus);
		const stats = statsBySlug[focusSlug];

		stats?.countryIsoCodes.forEach((countryIsoCode) => {
			optionsByCountryIsoCode.set(countryIsoCode, {
				value: countryIsoCode,
				label: getCountryNameByCode(countryIsoCode),
			});
		});
	});

	return [...optionsByCountryIsoCode.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};
