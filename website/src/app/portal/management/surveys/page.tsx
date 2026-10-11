import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedSurveyTableView } from '@/modules/surveys/survey.service';
import type { SurveyTableViewRow } from '@/modules/surveys/survey.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedSurveyTableView(user.id, tableQuery);

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
