import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { OrganizationReadService } from '@/lib/services/organization/organization-read.service';
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

	const service = new OrganizationReadService();
	const result = await service.getPaginatedOrganizationMembersTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: OrganizationMemberTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MembersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
