import { makePayoutColumns } from '@/components/data-table/columns/payouts';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { PayoutTableViewRow } from '@/modules/payouts/payout.types';

type PayoutsFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: {
		programs: { value: string; label: string }[];
		statuses: { value: string; label: string }[];
		mobileMoneyProviders: { value: string; label: string }[];
		recipients: { value: string; label: string }[];
	};
};

export const payoutsTableConfig: DataTableConfig<PayoutTableViewRow> = {
	id: 'payouts',
	title: 'Payouts',
	emptyMessage: 'No payouts found',
	searchKeys: ['id', 'recipientFirstName', 'recipientLastName', 'programName', 'mobileMoneyProviderName'],
	sortOptions: [
		{ id: 'recipient', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
		{ id: 'mobileMoneyProviderName', label: 'Mobile money provider' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'status', label: 'Status' },
		{ id: 'paymentAt', label: 'Payment date' },
	],
	makeColumns: () => makePayoutColumns(),
	showColumnVisibilitySelector: true,
};

export const recipientPayoutsTableConfig: DataTableConfig<PayoutTableViewRow> = {
	...payoutsTableConfig,
	id: 'recipient-payouts',
	searchKeys: ['id', 'mobileMoneyProviderName'],
	sortOptions: payoutsTableConfig.sortOptions?.filter(({ id }) => id !== 'recipient' && id !== 'programName'),
	makeColumns: () => makePayoutColumns({ hideRecipient: true, hideProgramName: true }),
};

export const getPayoutsTableFilters = ({ query, filterOptions }: PayoutsFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	const filters: TableFilterConfig[] = [
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
		{
			id: 'mobileMoneyProvider',
			queryKey: 'mobileMoneyProviderId',
			label: 'Mobile money provider',
			placeholder: 'All providers',
			value: query.mobileMoneyProviderId,
			options: filterOptions.mobileMoneyProviders,
		},
		{
			id: 'recipient',
			queryKey: 'recipientId',
			label: 'Recipient',
			placeholder: 'All recipients',
			value: query.recipientId,
			options: filterOptions.recipients,
			// Only reachable through a link, e.g. from the recipient dialog
			hidden: filterOptions.recipients.length === 0,
		},
	];

	return filters.filter((filter) => !filter.hidden);
};
