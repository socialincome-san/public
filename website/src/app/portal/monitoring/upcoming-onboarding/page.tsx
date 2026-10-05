import { UpcomingOnboardingTableClient } from '@/components/data-table/clients/upcoming-onboarding-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedUpcomingOnboardingRecipientTableView } from '@/modules/recipients/recipient.service';
import { Suspense } from 'react';

const UpcomingOnboardingPage = ({ searchParams }: SearchParamsPageProps) => {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<UpcomingOnboardingDataLoader searchParams={searchParams} />
		</Suspense>
	);
};

export default UpcomingOnboardingPage;

const UpcomingOnboardingDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedUpcomingOnboardingRecipientTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<UpcomingOnboardingTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
		/>
	);
};
