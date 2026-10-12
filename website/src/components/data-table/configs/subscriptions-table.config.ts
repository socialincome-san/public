import { makeSubscriptionsColumns } from '@/components/data-table/columns/subscriptions';
import { type TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import {
	SUBSCRIPTION_PAYMENT_METHOD_LABELS,
	SUBSCRIPTION_STATUS_LABELS,
	type SubscriptionTableViewRow,
} from '@/modules/subscriptions/subscription.types';
import { linkedRecordFilter } from './linked-record-filter';

type SubscriptionFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	contributorFilterOptions: { id: string; name: string }[];
	campaignFilterOptions: { id: string; name: string }[];
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
	makeColumns: () => makeSubscriptionsColumns(),
	showColumnVisibilitySelector: true,
};

export const contributorSubscriptionsTableConfig: DataTableConfig<SubscriptionTableViewRow> = {
	...subscriptionsTableConfig,
	id: 'contributor-subscriptions',
	searchKeys: ['id', 'stripeSubscriptionId', 'bankStandingOrderReference'],
	sortOptions: subscriptionsTableConfig.sortOptions?.filter(({ id }) => id !== 'contributor' && id !== 'email'),
	makeColumns: () => makeSubscriptionsColumns({ hideContributor: true }),
};

export const getSubscriptionsTableFilters = ({
	query,
	contributorFilterOptions,
	campaignFilterOptions,
}: SubscriptionFiltersArgs): TableFilterConfig[] => {
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
		...linkedRecordFilter({
			id: 'contributor',
			queryKey: 'contributorId',
			label: 'Contributor',
			placeholder: 'All contributors',
			value: query.contributorId,
			options: contributorFilterOptions.map((contributor) => ({ value: contributor.id, label: contributor.name })),
		}),
		...linkedRecordFilter({
			id: 'campaign',
			queryKey: 'campaignId',
			label: 'Campaign',
			placeholder: 'All campaigns',
			value: query.campaignId,
			options: campaignFilterOptions.map((campaign) => ({ value: campaign.id, label: campaign.name })),
		}),
	];
};
