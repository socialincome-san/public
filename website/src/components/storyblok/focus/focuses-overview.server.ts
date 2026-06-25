import type { PublicFocusStatsBySlugMap } from '@/lib/services/focus/focus.types';
import { getCountryNameByCode } from '@/lib/types/country';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusText, getFocusTitle } from './focus.utils';
import { COUNTRY_QUERY_KEY, SDG_QUERY_KEY, SEARCH_QUERY_KEY } from './focuses-overview-query';
import { getSdg } from './sdgs';

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

export const getSdgQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, SDG_QUERY_KEY);
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

export const focusMatchesSdgQuery = (focus: FocusStory, selectedSdg: string | undefined) => {
	if (!selectedSdg) {
		return true;
	}

	return focus.content.sdgs?.some((value) => String(getSdg(value)?.number) === selectedSdg) ?? false;
};

export const sortFocusesByCandidatesCountDesc = (focuses: FocusStory[], statsBySlug: PublicFocusStatsBySlugMap) =>
	[...focuses].sort((focusA, focusB) => {
		const candidatesCountA = statsBySlug[getFocusSlug(focusA)]?.candidatesCount ?? 0;
		const candidatesCountB = statsBySlug[getFocusSlug(focusB)]?.candidatesCount ?? 0;

		return candidatesCountB - candidatesCountA;
	});

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

export const getSdgFilterOptions = (focuses: FocusStory[]): FilterOption[] => {
	const optionsBySdgNumber = new Map<number, FilterOption>();

	focuses.forEach((focus) => {
		focus.content.sdgs?.forEach((value) => {
			const sdg = getSdg(value);

			if (sdg) {
				optionsBySdgNumber.set(sdg.number, {
					value: String(sdg.number),
					label: `SDG ${sdg.number}: ${sdg.title}`,
				});
			}
		});
	});

	return [...optionsBySdgNumber.entries()].sort(([numberA], [numberB]) => numberA - numberB).map(([, option]) => option);
};
