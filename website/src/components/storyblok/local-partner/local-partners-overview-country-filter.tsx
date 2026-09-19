'use client';

import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { COUNTRY_QUERY_KEY } from './local-partners-overview-query';
import type { FilterOption } from './local-partners-overview.server';

type Props = {
	allCountriesLabel: string;
	countryOptions: FilterOption[];
	selectedCountryIsoCode?: string;
};

export const LocalPartnersOverviewCountryFilter = ({ allCountriesLabel, countryOptions, selectedCountryIsoCode }: Props) => (
	<FilterDropdown
		allLabel={allCountriesLabel}
		options={countryOptions}
		queryKey={COUNTRY_QUERY_KEY}
		selectedValue={selectedCountryIsoCode}
	/>
);
