import { makeOngoingPayoutColumns } from '@/components/data-table/columns/ongoing-payouts';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { OngoingPayoutTableViewRow } from '@/lib/services/payout/payout.types';

export const ongoingPayoutsTableConfig: DataTableConfig<OngoingPayoutTableViewRow> = {
	id: 'ongoing-payouts',
	title: 'Ongoing Payouts',
	emptyMessage: 'No ongoing payouts found',
	searchKeys: ['firstName', 'lastName', 'programName'],
	sortOptions: [
		{ id: 'recipient', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
	],
	makeColumns: makeOngoingPayoutColumns,
	showColumnVisibilitySelector: true,
};
