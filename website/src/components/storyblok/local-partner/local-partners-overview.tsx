import type { AnySearchParams } from '@/app/page-props';
import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { FilterBar } from '@socialincome/design-system/layout/filter-bar/filter-bar';
import { getTranslations } from 'next-intl/server';
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
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

export const LocalPartnersOverview = async ({ localPartners, lang, currency, searchParams }: Props) => {
	const [t, resolvedSearchParams] = await Promise.all([getTranslations('website-common'), searchParams]);
	const searchQuery = getSearchQuery(resolvedSearchParams);
	const countryQuery = getCountryQuery(resolvedSearchParams);
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
		<>
			<FilterBar
				filters={
					<LocalPartnersOverviewCountryFilter
						allCountriesLabel={t('local-partners-page.all-countries', { count: countryOptions.length })}
						countryOptions={countryOptions}
						selectedCountryIsoCode={selectedCountryIsoCode}
					/>
				}
				search={
					<LocalPartnersOverviewSearch
						defaultValue={searchQuery}
						label={t('local-partners-page.search-label')}
						placeholder={t('local-partners-page.search-placeholder')}
					/>
				}
			/>
			<LocalPartnersGrid
				localPartners={filteredLocalPartners}
				lang={lang}
				currency={currency}
				hasActiveFilters={hasActiveFilters}
			/>
		</>
	);
};
