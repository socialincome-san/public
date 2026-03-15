import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getUpcomingSurveysTableFilters,
	upcomingSurveysTableConfig,
} from '@/components/data-table/configs/upcoming-surveys-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';

import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function UpcomingSurveysPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<UpcomingSurveysDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const UpcomingSurveysDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.survey.getPaginatedUpcomingSurveyTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<ConfiguredDataTableClient
			config={upcomingSurveysTableConfig}
			titleInfoTooltip="Shows upcoming surveys for accessible programs that are due around the current period."
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={getUpcomingSurveysTableFilters({
				query: { ...tableQuery, totalRows },
				programFilterOptions,
			})}
		/>
	);
};
