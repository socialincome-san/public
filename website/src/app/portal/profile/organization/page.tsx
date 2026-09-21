import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import {
	getActiveOrganizationSummary,
	getPaginatedOrganizationMembersTableView,
} from '@/modules/organizations/organization.service';
import type { OrganizationMemberTableViewRow } from '@/modules/organizations/organization.types';
import { Suspense } from 'react';
import MembersTable from './members-table';

export default function ProfileOrganizationPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ProfileOrganizationDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ProfileOrganizationDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	if (user.type !== 'user') {
		return <p className="text-muted-foreground">This section is available for portal users only.</p>;
	}

	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const activeOrganizationSummaryResult = await getActiveOrganizationSummary(user.id);
	const result = await getPaginatedOrganizationMembersTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: OrganizationMemberTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const organizationName = activeOrganizationSummaryResult.success
		? activeOrganizationSummaryResult.data.name
		: (user.activeOrganization?.name ?? 'Organization');

	return <MembersTable rows={rows} error={error} organizationName={organizationName} query={{ ...tableQuery, totalRows }} />;
};
