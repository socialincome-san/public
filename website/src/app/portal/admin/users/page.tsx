import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedUserTableView } from '@/modules/users/user.service';
import type { UserTableViewRow } from '@/modules/users/user.types';
import { Suspense } from 'react';
import UsersTable from './users-table';

export default function UsersPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<UsersDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const UsersDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedUserTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: UserTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <UsersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
