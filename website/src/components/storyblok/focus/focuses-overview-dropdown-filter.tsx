'use client';

import { FilterDropdown } from '@/components/filters/filter-dropdown';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allOptionsLabel: string;
	options: FilterOption[];
	queryKey: string;
	selectedValue?: string;
};

export const FocusesOverviewDropdownFilter = ({ allOptionsLabel, options, queryKey, selectedValue }: Props) => (
	<FilterDropdown allLabel={allOptionsLabel} options={options} queryKey={queryKey} selectedValue={selectedValue} />
);
