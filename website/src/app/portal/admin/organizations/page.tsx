import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationsTableConfig } from '@/components/data-table/configs/organizations-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { OrganizationTableViewRow } from '@/lib/services/organization/organization.types';
import { getServices } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function OrganizationsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OrganizationsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const OrganizationsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getServices().organizationRead.getPaginatedAdminTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: OrganizationTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<ConfiguredDataTableClient
			config={organizationsTableConfig}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
		/>
	);
};
