import { FilterBar } from '@socialincome/design-system/layout/filter-bar/filter-bar';
import type { ReactNode } from 'react';
import { type FilterQueryParamOverride, SEARCH_QUERY_KEY } from './filter-query';
import { FilterSearch } from './filter-search';

type OverviewFilterBarProps = {
	/** The page's own filters, usually FilterDropdowns */
	filters: ReactNode;
	/** e.g. "18 programs", next to the search */
	countLabel: string;
	search: {
		label: string;
		placeholder: string;
		/** e.g. "Search 18 programs", while the search sits below the filters */
		compactPlaceholder: string;
		/** The current search term; while there is one the search stays, however short the list */
		query: string;
	};
	/** Number of items before any filter; decides whether a search is worth showing */
	totalCount: number;
	/** False renders only the list; the page then also ignores its filters in the URL */
	showFilters?: boolean;
	queryParamOverrides?: FilterQueryParamOverride[];
	/** The filtered list; the bar sets the space to it so every overview looks the same */
	children: ReactNode;
};

// Short lists are scanned faster than searched
const MAX_ITEMS_WITHOUT_SEARCH = 6;

export const OverviewFilterBar = ({
	filters,
	countLabel,
	search,
	totalCount,
	showFilters = true,
	queryParamOverrides,
	children,
}: OverviewFilterBarProps) => (
	<div className="flex w-full flex-col gap-8">
		{showFilters ? (
			<FilterBar
				filters={filters}
				summary={countLabel}
				search={
					totalCount > MAX_ITEMS_WITHOUT_SEARCH || search.query ? (
						<FilterSearch
							queryKey={SEARCH_QUERY_KEY}
							label={search.label}
							placeholder={search.placeholder}
							compactPlaceholder={search.compactPlaceholder}
							queryParamOverrides={queryParamOverrides}
						/>
					) : null
				}
			/>
		) : null}
		{children}
	</div>
);
