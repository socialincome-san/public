import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import {
	getActiveOrganizationSummary,
	getPaginatedOrganizationMembersTableView,
} from '@/modules/organizations/organization.service';
import type { OrganizationMemberTableViewRow } from '@/modules/organizations/organization.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireSession('user');

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
