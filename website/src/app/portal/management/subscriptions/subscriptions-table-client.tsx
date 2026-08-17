'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getSubscriptionsTableFilters,
	subscriptionsTableConfig,
} from '@/components/data-table/configs/subscriptions-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import {
	EMPTY_SUBSCRIPTION_FILTER_OPTIONS,
	type SubscriptionFilterOptions,
	type SubscriptionTableViewRow,
} from '@/lib/services/subscription/subscription.types';

export const SubscriptionsTableClient = ({
	rows,
	error,
	query,
	filterOptions = EMPTY_SUBSCRIPTION_FILTER_OPTIONS,
}: {
	rows: SubscriptionTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	filterOptions?: SubscriptionFilterOptions;
}) => {
	return (
		<ConfiguredDataTableClient
			config={subscriptionsTableConfig}
			titleInfoTooltip="Shows subscriptions in your active organization scope."
			rows={rows}
			error={error}
			query={query}
			toolbarFilters={getSubscriptionsTableFilters({ query, filterOptions })}
		/>
	);
};
