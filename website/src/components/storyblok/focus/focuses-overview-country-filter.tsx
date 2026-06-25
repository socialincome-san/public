import { FocusesOverviewDropdownFilter } from './focuses-overview-dropdown-filter';
import { COUNTRY_QUERY_KEY } from './focuses-overview-query';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allCountriesLabel: string;
	countryOptions: FilterOption[];
	selectedCountryIsoCode?: string;
};

export const FocusesOverviewCountryFilter = ({ allCountriesLabel, countryOptions, selectedCountryIsoCode }: Props) => (
	<FocusesOverviewDropdownFilter
		allOptionsLabel={allCountriesLabel}
		options={countryOptions}
		queryKey={COUNTRY_QUERY_KEY}
		selectedValue={selectedCountryIsoCode}
	/>
);
