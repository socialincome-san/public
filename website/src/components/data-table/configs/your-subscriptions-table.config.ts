import { makeYourStripeSubscriptionsColumns } from '@/components/data-table/columns/your-stripe-subscriptions';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';

export const getYourSubscriptionsTableConfig = ({
	title,
	emptyMessage,
}: {
	title: string;
	emptyMessage: string;
}): DataTableConfig<StripeSubscriptionRow> => ({
	id: 'your-subscriptions',
	title,
	emptyMessage,
	searchKeys: [],
	sortOptions: [
		{ id: 'created', label: 'Created' },
		{ id: 'status', label: 'Status' },
		{ id: 'interval', label: 'Interval' },
		{ id: 'paymentMethod', label: 'Payment method' },
		{ id: 'amount', label: 'Amount' },
	],
	makeColumns: makeYourStripeSubscriptionsColumns,
	showColumnVisibilitySelector: true,
	showEntityIdColumn: false,
});
