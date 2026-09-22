import { FilterBar } from '@/components/filters/filter-bar';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { AnySearchParams } from '@/lib/types/page-props';
import {
	getPublicProgramFilterDataByPortalSlugsAction,
	getPublicProgramStatsByPortalSlugsAction,
} from '@/modules/programs/program.actions';
import { getFocusesAction, getProgramsAction } from '@/modules/storyblok-content/storyblok-content.actions';
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
		getProgramsAction(lang),
		hasFixedFocus ? Promise.resolve(undefined) : getFocusesAction(lang),
	]);
	const programs = (programsResult.success ? programsResult.data : []) as ProgramStory[];
	const storyblokFocuses = (storyblokFocusesResult?.success ? storyblokFocusesResult.data : []) as FocusStory[];
	const programPortalSlugs = [...new Set(programs.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
	const filterDataResult = await getPublicProgramFilterDataByPortalSlugsAction(programPortalSlugs);
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};
	const fixedFocusId = hasFixedFocus ? getFocusIdBySlug(filterDataByPortalSlug, fixedFocusSlug) : undefined;
	const focusScopedPrograms = hasFixedFocus
		? fixedFocusId
			? programs.filter((program) => programMatchesFocusQuery(program, filterDataByPortalSlug, fixedFocusId))
			: []
		: programs;
	const focusScopedFilterData = getFilterDataForPrograms(focusScopedPrograms, filterDataByPortalSlug);
	const statsFilterData = hasFixedFocus ? focusScopedFilterData : filterDataByPortalSlug;
	const statsPortalSlugs = Object.keys(statsFilterData);
	const [statsResult, translator] = await Promise.all([
		getPublicProgramStatsByPortalSlugsAction(statsPortalSlugs),
		Translator.getInstance({ language: lang, namespaces: ['website-common'] }),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
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
		<div className="flex w-full flex-col gap-4">
			<FilterBar
				filters={
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
				}
				search={
					<ProgramsOverviewSearch
						defaultValue={searchQuery}
						label={translator.t('programs-page.search-label')}
						placeholder={translator.t('programs-page.search-placeholder')}
						queryParamOverrides={fixedQueryParams}
					/>
				}
			/>
			<ProgramsOverview programs={filteredPrograms} statsByPortalSlug={statsByPortalSlug} lang={lang} region={region} />
		</div>
	);
};
