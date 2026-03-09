import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { ongoingPayoutsTableConfig } from '@/components/data-table/configs/ongoing-payouts-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import type { TableFilterConfig } from '@/components/data-table/table-config.types';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { getServices } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function OngoingPayoutsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OngoingPayoutsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const OngoingPayoutsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getServices().payoutRead.getPaginatedOngoingPayoutTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];
	const toolbarFilters: TableFilterConfig[] = [
		{
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: tableQuery.programId,
			options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
		},
	];

	return (
		<ConfiguredDataTableClient
			config={ongoingPayoutsTableConfig}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={toolbarFilters}
		/>
	);
};
