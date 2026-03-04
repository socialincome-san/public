import { Card } from '@/components/card';
import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import DataTable from '@/components/data-table/data-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@/lib/services/survey/survey.service';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import { PlusIcon } from 'lucide-react';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };

export default function SurveysPageProgramScoped({ params }: Props) {
	return (
		<Card>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<SurveysProgramScopedDataLoader params={params} />
			</Suspense>
		</Card>
	);
}

const SurveysProgramScopedDataLoader = async ({ params }: { params: Promise<{ programId: string }> }) => {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const surveyService = new SurveyService();
	const surveysResult = await surveyService.getTableViewProgramScoped(user.id, programId);

	const error = surveysResult.success ? null : surveysResult.error;
	const rows: SurveyTableViewRow[] = surveysResult.success ? surveysResult.data.tableRows : [];

	return (
		<DataTable
			title="Surveys"
			error={error}
			emptyMessage="No surveys found"
			data={rows}
			makeColumns={makeSurveyColumns}
			actionMenuItems={[
				{
					label: 'Add new survey',
					icon: <PlusIcon />,
					disabled: true,
				},
			]}
			hideProgramName
			searchKeys={['name', 'recipientName']}
		/>
	);
};
