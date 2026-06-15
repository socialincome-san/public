import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { FocusStory } from '../focus/focus.types';
import type { ProgramStory } from './program.types';
import { getProgramPortalSlug } from './program.utils';
import { ProgramsOverview } from './programs-overview';
import { ProgramsOverviewFilters } from './programs-overview-filters';
import { FOCUS_QUERY_KEY } from './programs-overview-query';
import { ProgramsOverviewSearch } from './programs-overview-search';
import {
	getCountryFilterOptions,
	getCountryQuery,
	getFilterDataForPrograms,
	getFocusFilterOptions,
	getFocusIdBySlug,
	getFocusQuery,
	getFocusTitleBySlug,
	getSearchQuery,
	programMatchesCountryQuery,
	programMatchesFocusQuery,
	programMatchesSearchQuery,
	toPortalSlugStatsMap,
} from './programs-overview.server';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
	fixedFocusSlug?: string;
};

export const ProgramsOverviewSection = async ({ lang, region, searchParams, fixedFocusSlug }: Props) => {
	const hasFixedFocus = fixedFocusSlug !== undefined;
	const [programsResult, storyblokFocusesResult] = await Promise.all([
		services.storyblok.getPrograms(lang),
		hasFixedFocus ? Promise.resolve(undefined) : services.storyblok.getFocuses(lang),
	]);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const storyblokFocuses = (storyblokFocusesResult?.success ? storyblokFocusesResult.data : []) as FocusStory[];
	const programPortalSlugs = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const filterDataResult = await services.read.program.getPublicProgramFilterDataByPortalSlugs(programPortalSlugs);
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};
	const fixedFocusId = hasFixedFocus ? getFocusIdBySlug(filterDataByPortalSlug, fixedFocusSlug) : undefined;
	const focusScopedPrograms = hasFixedFocus
		? fixedFocusId
			? programs.filter((program) => programMatchesFocusQuery(program, filterDataByPortalSlug, fixedFocusId))
			: []
		: programs;
	const focusScopedFilterData = getFilterDataForPrograms(focusScopedPrograms, filterDataByPortalSlug);
	const statsFilterData = hasFixedFocus ? focusScopedFilterData : filterDataByPortalSlug;
	const statsPrograms = hasFixedFocus ? focusScopedPrograms : programs;
	const programIds = [...new Set(Object.values(statsFilterData).map(({ programId }) => programId))];
	const [statsResult, translator] = await Promise.all([
		services.read.program.getPublicProgramStatsByIds(programIds),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);
	const statsByPortalSlug = toPortalSlugStatsMap(
		statsPrograms,
		statsFilterData,
		statsResult.success ? statsResult.data : {},
	);
	const countryOptions = getCountryFilterOptions(focusScopedFilterData);
	const focusTitleBySlug = getFocusTitleBySlug(storyblokFocuses);
	const focusFilterOptions = hasFixedFocus ? [] : getFocusFilterOptions(filterDataByPortalSlug, focusTitleBySlug);
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const focusQuery = getFocusQuery(searchParams);
	const selectedCountryIsoCode = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const selectedFocusId = hasFixedFocus
		? fixedFocusId
		: focusFilterOptions.some((option) => option.value === focusQuery)
			? focusQuery
			: undefined;
	const countryFilteredPrograms = focusScopedPrograms.filter((program) =>
		programMatchesCountryQuery(program, focusScopedFilterData, selectedCountryIsoCode),
	);
	const focusFilteredPrograms = hasFixedFocus
		? countryFilteredPrograms
		: countryFilteredPrograms.filter((program) =>
				programMatchesFocusQuery(program, filterDataByPortalSlug, selectedFocusId),
			);
	const filteredPrograms = searchQuery
		? focusFilteredPrograms.filter((program) => programMatchesSearchQuery(program, searchQuery))
		: focusFilteredPrograms;
	const fixedQueryParams = hasFixedFocus ? [{ key: FOCUS_QUERY_KEY, value: fixedFocusId }] : [];

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<ProgramsOverviewFilters
					allCountriesLabel={translator.t('programs-page.all-countries', { context: { count: countryOptions.length } })}
					allFocusesLabel={translator.t('programs-page.all-focuses', { context: { count: focusFilterOptions.length } })}
					countryOptions={countryOptions}
					selectedCountryIsoCode={selectedCountryIsoCode}
					focusOptions={focusFilterOptions}
					selectedFocusId={selectedFocusId}
					showFocusFilter={!hasFixedFocus}
					queryParamOverrides={fixedQueryParams}
				/>
				<ProgramsOverviewSearch
					defaultValue={searchQuery}
					label={translator.t('programs-page.search-label')}
					placeholder={translator.t('programs-page.search-placeholder')}
					queryParamOverrides={fixedQueryParams}
				/>
			</div>
			<ProgramsOverview programs={filteredPrograms} statsById={statsByPortalSlug} lang={lang} region={region} />
		</>
	);
};
