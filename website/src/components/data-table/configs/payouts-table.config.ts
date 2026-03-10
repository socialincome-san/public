import { makePayoutColumns } from '@/components/data-table/columns/payouts';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';

type PayoutsFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: {
		programs: { value: string; label: string }[];
		statuses: { value: string; label: string }[];
	};
};

export const payoutsTableConfig: DataTableConfig<PayoutTableViewRow> = {
	id: 'payouts',
	title: 'Payouts',
	emptyMessage: 'No payouts found',
	searchKeys: ['id', 'recipientFirstName', 'recipientLastName', 'programName'],
	sortOptions: [
		{ id: 'recipient', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'status', label: 'Status' },
		{ id: 'paymentAt', label: 'Payment date' },
	],
	makeColumns: makePayoutColumns,
	showColumnVisibilitySelector: true,
};

export const getPayoutsTableFilters = ({ query, filterOptions }: PayoutsFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: query.programId,
			options: filterOptions.programs,
		},
		{
			id: 'payoutStatus',
			queryKey: 'payoutStatus',
			label: 'Status',
			placeholder: 'All statuses',
			value: query.payoutStatus,
			options: filterOptions.statuses,
		},
	];
};
