import { Card } from '@/components/card';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyReadService } from '@/lib/services/survey/survey-read.service';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import { SurveysTableClient } from '@/app/portal/management/surveys/surveys-table-client';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default function SurveysPageProgramScoped({ params, searchParams }: Props) {
	return (
		<Card>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<SurveysProgramScopedDataLoader params={params} searchParams={searchParams} />
			</Suspense>
		</Card>
	);
}

const SurveysProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const baseQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const tableQuery = { ...baseQuery, programId };
	const user = await getAuthenticatedUserOrRedirect();

	const surveyService = new SurveyReadService();
	const surveysResult = await surveyService.getPaginatedTableView(user.id, tableQuery);

	const error = surveysResult.success ? null : surveysResult.error;
	const rows: SurveyTableViewRow[] = surveysResult.success ? surveysResult.data.tableRows : [];
	const totalRows = surveysResult.success ? surveysResult.data.totalCount : 0;

	return (
		<SurveysTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			showProgramFilter={false}
			hideProgramName
		/>
	);
};
