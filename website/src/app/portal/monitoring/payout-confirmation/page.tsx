import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getPayoutConfirmationTableFilters,
	payoutConfirmationTableConfig,
} from '@/components/data-table/configs/payout-confirmation-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedPayoutConfirmationTableView } from '@/modules/payouts/payout.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';

import type { SearchParamsPageProps } from '@/app/page-props';
import { Suspense } from 'react';

export default function ConfirmPayoutsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ConfirmPayoutsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ConfirmPayoutsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedPayoutConfirmationTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<ConfiguredDataTableClient
			config={payoutConfirmationTableConfig}
			titleInfoTooltip="Inbox view: only payouts with status paid are shown until confirmed or contested."
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={getPayoutConfirmationTableFilters({
				query: { ...tableQuery, totalRows },
				filterOptions: {
					programs: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
				},
			})}
		/>
	);
};
