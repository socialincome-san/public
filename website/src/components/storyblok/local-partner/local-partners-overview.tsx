import { BlockWrapper } from '@/components/block-wrapper';
import { FilterBar } from '@/components/filters/filter-bar';
import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { LocalPartnerStory } from './local-partner.types';
import { LocalPartnersOverviewCountryFilter } from './local-partners-overview-country-filter';
import { LocalPartnersOverviewSearch } from './local-partners-overview-search';
import {
	getCountryFilterOptions,
	getCountryQuery,
	getSearchQuery,
	localPartnerMatchesCountryQuery,
	localPartnerMatchesSearchQuery,
} from './local-partners-overview.server';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
	searchParams?: AnySearchParams;
};

export const LocalPartnersOverview = async ({ localPartners, lang, region, title, text, searchParams }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());
	const searchQuery = getSearchQuery(searchParams);
	const countryQuery = getCountryQuery(searchParams);
	const countryOptions = getCountryFilterOptions(localPartners);
	const selectedCountryIsoCode = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const hasActiveFilters = Boolean(searchQuery) || Boolean(selectedCountryIsoCode);
	const countryFilteredLocalPartners = localPartners.filter((localPartner) =>
		localPartnerMatchesCountryQuery(localPartner, selectedCountryIsoCode),
	);
	const filteredLocalPartners = searchQuery
		? countryFilteredLocalPartners.filter((localPartner) => localPartnerMatchesSearchQuery(localPartner, searchQuery))
		: countryFilteredLocalPartners;

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<div className="flex w-full flex-col gap-8">
				{hasCmsHeader ? (
					<CmsHeader title={title} text={text} textClassName="max-w-2xl" />
				) : (
					<LocalPartnersTeaserIntro lang={lang} />
				)}
				<FilterBar
					filters={
						<LocalPartnersOverviewCountryFilter
							allCountriesLabel={translator.t('local-partners-page.all-countries', {
								context: { count: countryOptions.length },
							})}
							countryOptions={countryOptions}
							selectedCountryIsoCode={selectedCountryIsoCode}
						/>
					}
					search={
						<LocalPartnersOverviewSearch
							defaultValue={searchQuery}
							label={translator.t('local-partners-page.search-label')}
							placeholder={translator.t('local-partners-page.search-placeholder')}
						/>
					}
				/>
				<LocalPartnersGrid
					localPartners={filteredLocalPartners}
					lang={lang}
					region={region}
					hasActiveFilters={hasActiveFilters}
				/>
			</div>
		</BlockWrapper>
	);
};
