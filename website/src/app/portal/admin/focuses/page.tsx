import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedFocusTableView } from '@/modules/focuses/focus.service';
import type { FocusTableViewRow } from '@/modules/focuses/focus.types';
import { Suspense } from 'react';
import FocusesTable from './focuses-table';

export default function FocusesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<FocusesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const FocusesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedFocusTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: FocusTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <FocusesTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
