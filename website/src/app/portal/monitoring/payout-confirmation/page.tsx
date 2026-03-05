import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getPayoutConfirmationTableFilters,
	payoutConfirmationTableConfig,
} from '@/components/data-table/configs/payout-confirmation-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutReadService } from '@/lib/services/payout/payout-read.service';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function ConfirmPayoutsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ConfirmPayoutsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ConfirmPayoutsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const service = new PayoutReadService();
	const result = await service.getPaginatedPayoutConfirmationTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];
	const statusFilterOptions = result.success ? result.data.statusFilterOptions : [];

	return (
		<ConfiguredDataTableClient
			config={payoutConfirmationTableConfig}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={getPayoutConfirmationTableFilters({
				query: { ...tableQuery, totalRows },
				filterOptions: {
					programs: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
					statuses: statusFilterOptions,
				},
			})}
		/>
	);
};
