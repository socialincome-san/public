import { makeSubscriptionsColumns } from '@/components/data-table/columns/subscriptions';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { SubscriptionFilterOptions, SubscriptionTableViewRow } from '@/lib/services/subscription/subscription.types';

type SubscriptionFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: SubscriptionFilterOptions;
};

export const subscriptionsTableConfig: DataTableConfig<SubscriptionTableViewRow> = {
	id: 'subscriptions',
	title: 'Subscriptions',
	emptyMessage: 'No subscriptions found',
	searchKeys: [
		'id',
		'firstName',
		'lastName',
		'email',
		'campaignTitle',
		'programName',
		'stripeSubscriptionId',
		'bankStandingOrderReference',
	],
	sortOptions: [
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'campaignTitle', label: 'Campaign' },
		{ id: 'programName', label: 'Program' },
		{ id: 'status', label: 'Status' },
		{ id: 'paymentMethod', label: 'Payment method' },
		{ id: 'stripeSubscriptionId', label: 'Stripe ID' },
		{ id: 'bankStandingOrderReference', label: 'Bank standing-order reference' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeSubscriptionsColumns,
	showColumnVisibilitySelector: true,
};

export const getSubscriptionsTableFilters = ({ query, filterOptions }: SubscriptionFiltersArgs): TableFilterConfig[] => {
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
			id: 'subscriptionStatus',
			queryKey: 'subscriptionStatus',
			label: 'Status',
			placeholder: 'All statuses',
			value: query.subscriptionStatus,
			options: filterOptions.statuses,
		},
		{
			id: 'subscriptionPaymentMethod',
			queryKey: 'subscriptionPaymentMethod',
			label: 'Payment method',
			placeholder: 'All payment methods',
			value: query.subscriptionPaymentMethod,
			options: filterOptions.paymentMethods,
		},
	];
};
