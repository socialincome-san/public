import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyReadService } from '@/lib/services/survey/survey-read.service';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import { SurveysTableClient } from './surveys-table-client';

export default function SurveysPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SurveysDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const SurveysDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const service = new SurveyReadService();
	const result = await service.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: SurveyTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<SurveysTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
		/>
	);
};
