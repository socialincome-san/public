import type { AnySearchParams } from '@/app/page-props';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPublicFocusStatsBySlugsAction } from '@/modules/focuses/focus.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { FilterBar } from '@socialincome/design-system/layout/filter-bar/filter-bar';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
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
	title?: string;
	text?: string;
	searchParams?: AnySearchParams;
};

export const FocusesOverview = async ({ focuses, lang, region, title, text, searchParams }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const focusSlugs = focuses.map((focus) => getFocusSlug(focus));
	const statsResult = await getPublicFocusStatsBySlugsAction(focusSlugs);
	const statsBySlug = statsResult.success ? statsResult.data : {};
	const hasStatsError = !statsResult.success;
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const sdgQuery = getSdgQuery(searchParams);
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
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<div className="flex w-full flex-col gap-8">
				<PageIntro title={title} description={text} />
				<FilterBar
					filters={
						<>
							<FocusesOverviewCountryFilter
								allCountriesLabel={translator.t('focuses-page.all-countries', {
									context: { count: countryOptions.length },
								})}
								countryOptions={countryOptions}
								selectedCountryIsoCode={selectedCountryIsoCode}
							/>
							<FocusesOverviewSdgFilter
								allSdgsLabel={translator.t('focuses-page.all-sdgs', {
									context: { count: sdgOptions.length },
								})}
								sdgOptions={sdgOptions}
								selectedSdg={selectedSdg}
							/>
						</>
					}
					search={
						<FocusesOverviewSearch
							defaultValue={searchQuery}
							label={translator.t('focuses-page.search-label')}
							placeholder={translator.t('focuses-page.search-placeholder')}
						/>
					}
				/>
				{hasStatsError ? <p className="text-destructive">{translator.t('focuses-page.load-stats-error')}</p> : null}
				<CardGrid emptyMessage={translator.t(hasActiveFilters ? 'focuses-page.no-results' : 'focuses-page.empty')}>
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
										recipients: translator.t('focuses-page.recipients'),
										programs: translator.t('focuses-page.programs'),
										sdgs: translator.t('focuses-page.sdgs'),
										candidatesReady:
											stats.candidatesCount > 0
												? translator.t(
														stats.candidatesCount === 1
															? 'focuses-page.candidates-ready-to-enroll_one'
															: 'focuses-page.candidates-ready-to-enroll_other',
														{ context: { count: stats.candidatesCount } },
													)
												: translator.t('focuses-page.no-candidates'),
									}}
								/>
							</CardGridItem>
						);
					})}
				</CardGrid>
			</div>
		</BlockWrapper>
	);
};
