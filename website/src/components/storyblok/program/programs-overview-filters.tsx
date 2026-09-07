'use client';

import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { COUNTRY_QUERY_KEY, FOCUS_QUERY_KEY, type QueryParamOverride } from './programs-overview-query';

type FilterOption = {
	value: string;
	label: string;
};

type ProgramsOverviewFiltersProps = {
	allCountriesLabel: string;
	allFocusesLabel: string;
	countryOptions: FilterOption[];
	selectedCountryIsoCode?: string;
	focusOptions: FilterOption[];
	selectedFocusId?: string;
	showFocusFilter?: boolean;
	queryParamOverrides?: QueryParamOverride[];
};

export const ProgramsOverviewFilters = ({
	allCountriesLabel,
	allFocusesLabel,
	countryOptions,
	selectedCountryIsoCode,
	focusOptions,
	selectedFocusId,
	showFocusFilter = true,
	queryParamOverrides,
}: ProgramsOverviewFiltersProps) => {
	return (
		<>
			<FilterDropdown
				allLabel={allCountriesLabel}
				options={countryOptions}
				queryKey={COUNTRY_QUERY_KEY}
				selectedValue={selectedCountryIsoCode}
				queryParamOverrides={queryParamOverrides}
			/>
			{showFocusFilter && (
				<FilterDropdown
					allLabel={allFocusesLabel}
					options={focusOptions}
					queryKey={FOCUS_QUERY_KEY}
					selectedValue={selectedFocusId}
					queryParamOverrides={queryParamOverrides}
				/>
			)}
		</>
	);
};
