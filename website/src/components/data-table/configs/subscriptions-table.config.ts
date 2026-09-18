import { makeSubscriptionsColumns } from '@/components/data-table/columns/subscriptions';
import { type TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import {
	SUBSCRIPTION_PAYMENT_METHOD_LABELS,
	SUBSCRIPTION_STATUS_LABELS,
	type SubscriptionTableViewRow,
} from '@/lib/services/subscription/subscription.types';

type SubscriptionFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
};

export const subscriptionsTableConfig: DataTableConfig<SubscriptionTableViewRow> = {
	id: 'subscriptions',
	title: 'Subscriptions',
	emptyMessage: 'No subscriptions found',
	searchKeys: ['id', 'firstName', 'lastName', 'email', 'stripeSubscriptionId', 'bankStandingOrderReference'],
	sortOptions: [
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'status', label: 'Status' },
		{ id: 'cancellationReason', label: 'Cancellation reason' },
		{ id: 'paymentMethod', label: 'Payment method' },
		{ id: 'stripeSubscriptionId', label: 'Stripe ID' },
		{ id: 'bankStandingOrderReference', label: 'Bank standing-order reference' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeSubscriptionsColumns,
	showColumnVisibilitySelector: true,
};

export const getSubscriptionsTableFilters = ({ query }: SubscriptionFiltersArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'subscriptionStatus',
			queryKey: 'subscriptionStatus',
			label: 'Status',
			placeholder: 'All statuses',
			value: query.subscriptionStatus,
			options: Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
		},
		{
			id: 'subscriptionPaymentMethod',
			queryKey: 'subscriptionPaymentMethod',
			label: 'Payment method',
			placeholder: 'All payment methods',
			value: query.subscriptionPaymentMethod,
			options: Object.entries(SUBSCRIPTION_PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label })),
		},
	];
};
