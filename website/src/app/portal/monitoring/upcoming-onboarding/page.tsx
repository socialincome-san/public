import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getUpcomingOnboardingTableFilters,
	upcomingOnboardingTableConfig,
} from '@/components/data-table/configs/upcoming-onboarding-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
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

	return (
		<ConfiguredDataTableClient
			config={upcomingOnboardingTableConfig}
			titleInfoTooltip="Shows recipients who have a future start date, sorted by how soon they are onboarding."
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={getUpcomingOnboardingTableFilters({
				query: { ...tableQuery, totalRows },
				programFilterOptions,
			})}
		/>
	);
};
