import { makePayoutConfirmationColumns } from '@/components/data-table/columns/payout-confirmation';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { PayoutConfirmationTableViewRow } from '@/lib/services/payout/payout.types';

type PayoutConfirmationFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: {
		programs: { value: string; label: string }[];
		statuses: { value: string; label: string }[];
	};
};

export const payoutConfirmationTableConfig: DataTableConfig<PayoutConfirmationTableViewRow> = {
	id: 'payout-confirmation',
	title: 'Payout confirmations',
	emptyMessage: 'No payouts waiting for confirmation',
	searchKeys: ['recipientFirstName', 'recipientLastName', 'programName', 'phoneNumber'],
	sortOptions: [
		{ id: 'recipient', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'currency', label: 'Currency' },
		{ id: 'status', label: 'Status' },
		{ id: 'paymentAt', label: 'Payment date' },
		{ id: 'phoneNumber', label: 'Phone number' },
	],
	makeColumns: makePayoutConfirmationColumns,
	initialSorting: [{ id: 'paymentAt', desc: false }],
	showColumnVisibilitySelector: true,
};

export const getPayoutConfirmationTableFilters = ({
	query,
	filterOptions,
}: PayoutConfirmationFiltersArgs): TableFilterConfig[] => {
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
