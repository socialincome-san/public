import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { UserReadService } from '@/lib/services/user/user-read.service';
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

	const service = new UserReadService();
	const result = await service.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: UserTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <UsersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
