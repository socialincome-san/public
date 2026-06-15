import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import type { PublicProgramFilterDataMap, PublicProgramStatsMap } from '@/lib/services/program/program.types';
import { getCountryNameByCode } from '@/lib/types/country';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ProgramStory } from './program.types';
import { getProgramId as getProgramPortalSlug, getProgramSlug, getProgramTitle } from './program.utils';
import { COUNTRY_QUERY_KEY, FOCUS_QUERY_KEY, SEARCH_QUERY_KEY } from './programs-overview-query';

type FilterOption = {
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

export const getFocusQuery = (searchParams?: AnySearchParams) => {
	return getQueryValue(searchParams, FOCUS_QUERY_KEY);
};

const normalizeSearchValue = (value: string) => value.toLowerCase();

export const programMatchesSearchQuery = (program: ProgramStory, searchQuery: string) => {
	const keywords = [
		getProgramTitle(program.content),
		getProgramPortalSlug(program.content),
		getProgramSlug(program),
		program.content.description,
	]
		.map((value) => normalizeSearchValue(value))
		.join(' ');
	const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/);

	return searchTerms.every((term) => keywords.includes(term));
};

export const programMatchesCountryQuery = (
	program: ProgramStory,
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	selectedCountryIsoCode: string | undefined,
) => {
	if (!selectedCountryIsoCode) {
		return true;
	}

	const portalSlug = getProgramPortalSlug(program.content);

	return Boolean(portalSlug && filterDataByPortalSlug[portalSlug]?.countryIsoCode === selectedCountryIsoCode);
};

export const programMatchesFocusQuery = (
	program: ProgramStory,
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	selectedFocusId: string | undefined,
) => {
	if (!selectedFocusId) {
		return true;
	}

	const portalSlug = getProgramPortalSlug(program.content);

	return Boolean(portalSlug && filterDataByPortalSlug[portalSlug]?.focuses.some(({ id }) => id === selectedFocusId));
};

export const toPortalSlugStatsMap = (
	programs: ProgramStory[],
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	statsByProgramId: PublicProgramStatsMap,
): PublicProgramStatsMap => {
	const statsByPortalSlug: PublicProgramStatsMap = {};

	programs.forEach((program) => {
		const portalSlug = getProgramPortalSlug(program.content);
		const programId = filterDataByPortalSlug[portalSlug]?.programId;
		const stats = programId ? statsByProgramId[programId] : undefined;

		if (stats) {
			statsByPortalSlug[portalSlug] = stats;
		}
	});

	return statsByPortalSlug;
};

export const getFilterDataForPrograms = (
	programs: ProgramStory[],
	filterDataByPortalSlug: PublicProgramFilterDataMap,
): PublicProgramFilterDataMap => {
	return programs.reduce<PublicProgramFilterDataMap>((scopedFilterData, program) => {
		const portalSlug = getProgramPortalSlug(program.content);
		const filterData = filterDataByPortalSlug[portalSlug];

		if (filterData) {
			scopedFilterData[portalSlug] = filterData;
		}

		return scopedFilterData;
	}, {});
};

export const getCountryFilterOptions = (filterDataByPortalSlug: PublicProgramFilterDataMap): FilterOption[] => {
	const optionsByCountryIsoCode = new Map<string, FilterOption>();

	Object.values(filterDataByPortalSlug).forEach(({ countryIsoCode }) => {
		optionsByCountryIsoCode.set(countryIsoCode, {
			value: countryIsoCode,
			label: getCountryNameByCode(countryIsoCode),
		});
	});

	return [...optionsByCountryIsoCode.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

export const getFocusTitleBySlug = (focuses: FocusStory[]) => {
	const focusTitleBySlug = new Map<string, string>();

	focuses.forEach((focus) => {
		const slug = focus.content.portalSlug?.trim();
		const title = focus.content.title?.trim();

		if (slug && title) {
			focusTitleBySlug.set(slug, title);
		}
	});

	return focusTitleBySlug;
};

export const getFocusFilterOptions = (
	filterDataByPortalSlug: PublicProgramFilterDataMap,
	focusTitleBySlug: Map<string, string>,
): FilterOption[] => {
	const optionsByFocusId = new Map<string, FilterOption>();

	Object.values(filterDataByPortalSlug).forEach(({ focuses }) => {
		focuses.forEach((focus) => {
			optionsByFocusId.set(focus.id, {
				value: focus.id,
				label: focusTitleBySlug.get(focus.slug) ?? focus.slug,
			});
		});
	});

	return [...optionsByFocusId.values()].sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));
};

export const getFocusIdBySlug = (filterDataByPortalSlug: PublicProgramFilterDataMap, focusSlug: string | undefined) => {
	const normalizedFocusSlug = focusSlug?.trim();

	if (!normalizedFocusSlug) {
		return undefined;
	}

	for (const { focuses } of Object.values(filterDataByPortalSlug)) {
		const matchingFocus = focuses.find(({ slug }) => slug === normalizedFocusSlug);

		if (matchingFocus) {
			return matchingFocus.id;
		}
	}

	return undefined;
};
