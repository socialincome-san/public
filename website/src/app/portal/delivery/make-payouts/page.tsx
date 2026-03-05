import { PayoutsTableClient } from '@/app/portal/delivery/make-payouts/payouts-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutReadService } from '@/lib/services/payout/payout-read.service';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function PayoutsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<PayoutsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const PayoutsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const payoutService = new PayoutReadService();
	const result = await payoutService.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: PayoutTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];
	const statusFilterOptions = result.success ? result.data.statusFilterOptions : [];

	return (
		<PayoutsTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
			statusFilterOptions={statusFilterOptions}
		/>
	);
};
