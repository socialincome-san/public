'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getSubscriptionsTableFilters,
	subscriptionsTableConfig,
} from '@/components/data-table/configs/subscriptions-table.config';
import { type TableQueryState } from '@/components/data-table/query-state';
import { type SubscriptionTableViewRow } from '@/lib/services/subscription/subscription.types';

export const SubscriptionsTableClient = ({
	rows,
	error,
	query,
}: {
	rows: SubscriptionTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) => {
	return (
		<ConfiguredDataTableClient
			config={subscriptionsTableConfig}
			titleInfoTooltip="Shows subscriptions in programs you can access."
			rows={rows}
			error={error}
			query={query}
			toolbarFilters={getSubscriptionsTableFilters({ query })}
		/>
	);
};
