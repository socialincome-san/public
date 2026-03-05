import { makeContributionsColumns } from '@/components/data-table/columns/contributions';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { ContributionTableViewRow } from '@/lib/services/contribution/contribution.types';

type ContributionFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: {
		programs: { value: string; label: string }[];
		campaigns: { value: string; label: string }[];
		paymentEventTypes: { value: string; label: string }[];
	};
};

export const contributionsTableConfig: DataTableConfig<ContributionTableViewRow> = {
	id: 'contributions',
	title: 'Contributions',
	emptyMessage: 'No contributions found',
	searchKeys: ['firstName', 'lastName', 'email', 'campaignTitle', 'programName'],
	sortOptions: [
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'campaignTitle', label: 'Campaign' },
		{ id: 'programName', label: 'Program' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeContributionsColumns,
	showColumnVisibilitySelector: true,
};

export const getContributionsTableFilters = ({
	query,
	filterOptions,
}: ContributionFiltersArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'campaign',
			queryKey: 'campaignId',
			label: 'Campaign',
			placeholder: 'All campaigns',
			value: query.campaignId,
			options: filterOptions.campaigns,
		},
		{
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: query.programId,
			options: filterOptions.programs,
		},
		{
			id: 'paymentEventType',
			queryKey: 'paymentEventType',
			label: 'Payment type',
			placeholder: 'All payment types',
			value: query.paymentEventType,
			options: filterOptions.paymentEventTypes,
		},
	];
};
