import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getPaginatedOrganizationAdminTableView } from '@/modules/organizations/organization.service';
import type { OrganizationTableViewRow } from '@/modules/organizations/organization.types';
import { requireAdmin } from '@/server/session';
import { Suspense } from 'react';
import OrganizationsTable from './organizations-table';

export default function OrganizationsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OrganizationsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const OrganizationsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedOrganizationAdminTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: OrganizationTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <OrganizationsTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
