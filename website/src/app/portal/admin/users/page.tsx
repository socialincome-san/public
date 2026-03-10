import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { UserTableViewRow } from '@/lib/services/user/user.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
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
	await requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.user.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: UserTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <UsersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
