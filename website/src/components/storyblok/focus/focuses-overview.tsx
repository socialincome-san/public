import type { AnySearchParams } from '@/app/page-props';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPublicFocusStatsBySlugsAction } from '@/modules/focuses/focus.actions';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { FilterBar } from '@socialincome/design-system/layout/filter-bar/filter-bar';
import { getTranslations } from 'next-intl/server';
import { FocusDetailCard } from './focus-detail-card';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusTitle } from './focus.utils';
import { FocusesOverviewCountryFilter } from './focuses-overview-country-filter';
import { FocusesOverviewSdgFilter } from './focuses-overview-sdg-filter';
import { FocusesOverviewSearch } from './focuses-overview-search';
import {
	focusMatchesCountryQuery,
	focusMatchesSdgQuery,
	focusMatchesSearchQuery,
	getCountryFilterOptions,
	getCountryQuery,
	getSdgFilterOptions,
	getSdgQuery,
	getSearchQuery,
	sortFocusesByCandidatesCountDesc,
} from './focuses-overview.server';

type Props = {
	focuses: FocusStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams: Promise<AnySearchParams>;
};

export const FocusesOverview = async ({ focuses, lang, region, searchParams }: Props) => {
	const focusSlugs = focuses.map((focus) => getFocusSlug(focus));
	const [t, statsResult, resolvedSearchParams] = await Promise.all([
		getTranslations('website-common'),
		getPublicFocusStatsBySlugsAction(focusSlugs),
		searchParams,
	]);
	const statsBySlug = statsResult.success ? statsResult.data : {};
	const hasStatsError = !statsResult.success;
	const searchQuery = getSearchQuery(resolvedSearchParams);
	const countryQuery = getCountryQuery(resolvedSearchParams);
	const sdgQuery = getSdgQuery(resolvedSearchParams);
	const countryOptions = getCountryFilterOptions(focuses, statsBySlug);
	const sdgOptions = getSdgFilterOptions(focuses);
	const selectedCountryIsoCode = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const selectedSdg = sdgOptions.some((option) => option.value === sdgQuery) ? sdgQuery : undefined;
	const hasActiveFilters = Boolean(searchQuery) || Boolean(selectedCountryIsoCode) || Boolean(selectedSdg);
	const countryFilteredFocuses = focuses.filter((focus) =>
		focusMatchesCountryQuery(focus, statsBySlug, selectedCountryIsoCode),
	);
	const sdgFilteredFocuses = countryFilteredFocuses.filter((focus) => focusMatchesSdgQuery(focus, selectedSdg));
	const filteredFocuses = searchQuery
		? sdgFilteredFocuses.filter((focus) => focusMatchesSearchQuery(focus, searchQuery))
		: sdgFilteredFocuses;
	const sortedFocuses = sortFocusesByCandidatesCountDesc(filteredFocuses, statsBySlug);

	return (
		<>
			<FilterBar
				filters={
					<>
						<FocusesOverviewCountryFilter
							allCountriesLabel={t('focuses-page.all-countries', { count: countryOptions.length })}
							countryOptions={countryOptions}
							selectedCountryIsoCode={selectedCountryIsoCode}
						/>
						<FocusesOverviewSdgFilter
							allSdgsLabel={t('focuses-page.all-sdgs', { count: sdgOptions.length })}
							sdgOptions={sdgOptions}
							selectedSdg={selectedSdg}
						/>
					</>
				}
				search={
					<FocusesOverviewSearch
						defaultValue={searchQuery}
						label={t('focuses-page.search-label')}
						placeholder={t('focuses-page.search-placeholder')}
					/>
				}
			/>
			{hasStatsError ? <p className="text-destructive">{t('focuses-page.load-stats-error')}</p> : null}
			<CardGrid emptyMessage={t(hasActiveFilters ? 'focuses-page.no-results' : 'focuses-page.empty')}>
				{sortedFocuses.map((focus) => {
					const focusSlug = getFocusSlug(focus);
					const focusTitle = getFocusTitle(focus.content);
					const stats = statsBySlug[focusSlug] ?? {
						programsCount: 0,
						recipientsInProgramsCount: 0,
						candidatesCount: 0,
						countryIsoCodes: [],
					};

					return (
						<CardGridItem key={focus.uuid}>
							<FocusDetailCard
								href={`/${lang}/${region}/focuses/${focusSlug}`}
								focusTitle={focusTitle}
								recipientsCount={stats.recipientsInProgramsCount}
								programsCount={stats.programsCount}
								sdgValues={focus.content.sdgs}
								alertVariant={stats.candidatesCount > 0 ? 'confirm' : 'secondary'}
								labels={{
									recipients: t('focuses-page.recipients'),
									programs: t('focuses-page.programs'),
									sdgs: t('focuses-page.sdgs'),
									candidatesReady:
										stats.candidatesCount > 0
											? t('focuses-page.candidates-ready-to-enroll', { count: stats.candidatesCount })
											: t('focuses-page.no-candidates'),
								}}
							/>
						</CardGridItem>
					);
				})}
			</CardGrid>
		</>
	);
};
