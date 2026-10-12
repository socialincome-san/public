'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { recipientPayoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import { useLocalTableQuery } from '@/components/data-table/hooks/use-local-table-query';
import { getPayoutTableViewAction } from '@/modules/payouts/payout.actions';
import { useRouter } from 'next/navigation';

export const RecipientPayoutsTab = ({ recipientId }: { recipientId: string }) => {
	const router = useRouter();
	const { query, rows, error, isLoading, updateQuery } = useLocalTableQuery((tableQuery) =>
		getPayoutTableViewAction({ ...tableQuery, recipientId }),
	);

	return (
		<ConfiguredDataTableClient
			config={recipientPayoutsTableConfig}
			rows={rows}
			error={error}
			query={query}
			onQueryChange={updateQuery}
			isLoading={isLoading}
			showEntityIdColumn={false}
			onRowClick={(row) => router.push(`/portal/delivery/payouts?${new URLSearchParams({ recipientId, payoutId: row.id })}`)}
		/>
	);
};
