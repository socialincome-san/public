import { makeContributorColumns } from '@/components/data-table/columns/contributors';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';

export const contributorsTableConfig: DataTableConfig<ContributorTableViewRow> = {
	id: 'contributors',
	title: 'Contributors',
	emptyMessage: 'No contributors found',
	searchKeys: ['id', 'firstName', 'lastName', 'email'],
	sortOptions: [
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'country', label: 'Country' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeContributorColumns,
	showColumnVisibilitySelector: true,
};

type ContributorsFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	countryFilterOptions: {
		value: string;
		label: string;
	}[];
};

export const getContributorsTableFilters = ({
	query,
	countryFilterOptions,
}: ContributorsFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'country',
			queryKey: 'country',
			label: 'Country',
			placeholder: 'All countries',
			value: query.country,
			options: countryFilterOptions,
		},
	];
};
