import type { AnySearchParams } from '@/app/page-props';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { getSearchQuery } from '@/components/filters/filter-query';
import { OverviewFilterBar } from '@/components/filters/overview-filter-bar';
import { getStatusQuery, StatusFilter } from '@/components/filters/status-filter';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getPublicProgramFilterDataByPortalSlugsAction,
	getPublicProgramStatsByPortalSlugsAction,
} from '@/modules/programs/program.actions';
import { getFocusesAction, getProgramsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { getTranslations } from 'next-intl/server';
import type { FocusStory } from '../focus/focus.types';
import type { ProgramStory } from './program.types';
import { getProgramPortalSlug } from './program.utils';
import { ProgramsOverview } from './programs-overview';
import { COUNTRY_QUERY_KEY, FOCUS_QUERY_KEY } from './programs-overview-query';
import {
	getCountryFilterOptions,
	getCountryQuery,
	getFilterDataForPrograms,
	getFocusFilterOptions,
	getFocusIdBySlug,
	getFocusQuery,
	getFocusTitleBySlug,
	getProgramStatus,
	programMatchesCountryQuery,
	programMatchesFocusQuery,
	programMatchesSearchQuery,
	programMatchesStatusQuery,
} from './programs-overview.server';

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
	fixedFocusSlug?: string;
	showFilters?: boolean;
};

export const ProgramsOverviewSection = async ({ lang, currency, searchParams, fixedFocusSlug, showFilters }: Props) => {
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
	const [statsResult, t] = await Promise.all([
		getPublicProgramStatsByPortalSlugsAction(statsPortalSlugs),
		getTranslations('website-common'),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const countryOptions = getCountryFilterOptions(focusScopedFilterData);
	const focusTitleBySlug = getFocusTitleBySlug(storyblokFocuses);
	const focusFilterOptions = hasFixedFocus ? [] : getFocusFilterOptions(filterDataByPortalSlug, focusTitleBySlug);
	const resolvedSearchParams = await searchParams;
	const searchQuery = getSearchQuery(resolvedSearchParams);
	const countryQuery = getCountryQuery(resolvedSearchParams);
	const focusQuery = getFocusQuery(resolvedSearchParams);
	const statuses = focusScopedPrograms.map((program) => getProgramStatus(program, statsByPortalSlug));
	const statusQuery = getStatusQuery(resolvedSearchParams);
	const selectedStatus = statusQuery && statuses.includes(statusQuery) ? statusQuery : undefined;
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
	const statusFilteredPrograms = focusFilteredPrograms.filter((program) =>
		programMatchesStatusQuery(program, statsByPortalSlug, selectedStatus),
	);
	const filteredPrograms = searchQuery
		? statusFilteredPrograms.filter((program) => programMatchesSearchQuery(program, searchQuery))
		: statusFilteredPrograms;
	const fixedQueryParams = hasFixedFocus ? [{ key: FOCUS_QUERY_KEY, value: fixedFocusId }] : [];

	return (
		<OverviewFilterBar
			filters={
				<>
					<FilterDropdown
						allLabel={t('programs-page.all-countries', { count: countryOptions.length })}
						options={countryOptions}
						queryKey={COUNTRY_QUERY_KEY}
						selectedValue={selectedCountryIsoCode}
						queryParamOverrides={fixedQueryParams}
					/>
					{hasFixedFocus ? null : (
						<FilterDropdown
							allLabel={t('programs-page.all-focuses', { count: focusFilterOptions.length })}
							options={focusFilterOptions}
							queryKey={FOCUS_QUERY_KEY}
							selectedValue={selectedFocusId}
							queryParamOverrides={fixedQueryParams}
						/>
					)}
					<StatusFilter statuses={statuses} selectedStatus={selectedStatus} queryParamOverrides={fixedQueryParams} />
				</>
			}
			totalCount={focusScopedPrograms.length}
			showFilters={showFilters}
			countLabel={t('programs-page.program-count', { count: filteredPrograms.length })}
			search={{
				label: t('programs-page.search-label'),
				placeholder: t('programs-page.search-placeholder'),
				compactPlaceholder: t('programs-page.search-placeholder-count', { count: filteredPrograms.length }),
				query: searchQuery,
			}}
			queryParamOverrides={fixedQueryParams}
		>
			<ProgramsOverview programs={filteredPrograms} statsByPortalSlug={statsByPortalSlug} lang={lang} currency={currency} />
		</OverviewFilterBar>
	);
};
