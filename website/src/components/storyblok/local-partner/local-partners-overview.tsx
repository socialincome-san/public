import type { AnySearchParams } from '@/app/page-props';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { getSearchQuery } from '@/components/filters/filter-query';
import { OverviewFilterBar } from '@/components/filters/overview-filter-bar';
import { getStatusQuery, StatusFilter } from '@/components/filters/status-filter';
import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnerOverviewStatsAction } from '@/modules/local-partners/local-partner.actions';
import { getTranslations } from 'next-intl/server';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerPortalSlug } from './local-partner.utils';
import { COUNTRY_QUERY_KEY } from './local-partners-overview-query';
import {
	getCountryFilterOptions,
	getCountryQuery,
	getLocalPartnerStatus,
	localPartnerMatchesCountryQuery,
	localPartnerMatchesSearchQuery,
} from './local-partners-overview.server';

type Props = {
	localPartners: LocalPartnerStory[];
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
	showFilters?: boolean;
};

export const LocalPartnersOverview = async ({ localPartners, lang, currency, searchParams, showFilters }: Props) => {
	const portalSlugs = localPartners.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [t, resolvedSearchParams, statsResult] = await Promise.all([
		getTranslations('website-common'),
		searchParams,
		getLocalPartnerOverviewStatsAction(portalSlugs),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const statuses = localPartners.map((localPartner) => getLocalPartnerStatus(localPartner, statsByPortalSlug));
	const statusQuery = getStatusQuery(resolvedSearchParams);
	const selectedStatus = statusQuery && statuses.includes(statusQuery) ? statusQuery : undefined;
	const searchQuery = getSearchQuery(resolvedSearchParams);
	const countryQuery = getCountryQuery(resolvedSearchParams);
	const countryOptions = getCountryFilterOptions(localPartners);
	const selectedCountryIsoCode = countryOptions.some((option) => option.value === countryQuery) ? countryQuery : undefined;
	const hasActiveFilters = Boolean(searchQuery) || Boolean(selectedCountryIsoCode) || Boolean(selectedStatus);
	const countryFilteredLocalPartners = localPartners.filter(
		(localPartner) =>
			localPartnerMatchesCountryQuery(localPartner, selectedCountryIsoCode) &&
			(!selectedStatus || getLocalPartnerStatus(localPartner, statsByPortalSlug) === selectedStatus),
	);
	const filteredLocalPartners = searchQuery
		? countryFilteredLocalPartners.filter((localPartner) => localPartnerMatchesSearchQuery(localPartner, searchQuery))
		: countryFilteredLocalPartners;

	return (
		<OverviewFilterBar
			filters={
				<>
					<FilterDropdown
						allLabel={t('local-partners-page.all-countries', { count: countryOptions.length })}
						options={countryOptions}
						queryKey={COUNTRY_QUERY_KEY}
						selectedValue={selectedCountryIsoCode}
					/>
					<StatusFilter statuses={statuses} selectedStatus={selectedStatus} />
				</>
			}
			totalCount={localPartners.length}
			showFilters={showFilters}
			countLabel={t('local-partners-page.local-partner-count', { count: filteredLocalPartners.length })}
			search={{
				label: t('local-partners-page.search-label'),
				placeholder: t('local-partners-page.search-placeholder'),
				compactPlaceholder: t('local-partners-page.search-placeholder-count', { count: filteredLocalPartners.length }),
				query: searchQuery,
			}}
		>
			<LocalPartnersGrid
				localPartners={filteredLocalPartners}
				statsByPortalSlug={statsByPortalSlug}
				lang={lang}
				currency={currency}
				hasActiveFilters={hasActiveFilters}
			/>
		</OverviewFilterBar>
	);
};
