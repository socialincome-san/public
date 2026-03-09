import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { getServices } from '@/lib/services/services';
import { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import MembersTable from './members-table';

export default function OrganizationMembersPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OrganizationMembersDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const OrganizationMembersDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	
	const result = await getServices().organizationRead.getPaginatedOrganizationMembersTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: OrganizationMemberTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MembersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
