import { UpcomingOnboardingTableClient } from '@/components/data-table/clients/upcoming-onboarding-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function UpcomingOnboardingPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<UpcomingOnboardingDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const UpcomingOnboardingDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.recipient.getPaginatedUpcomingOnboardingTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];
	const readOnly = result.success ? result.data.permission !== ProgramPermission.operator : true;

	return (
		<UpcomingOnboardingTableClient
			rows={rows}
			error={error}
			readOnly={readOnly}
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
		/>
	);
};
