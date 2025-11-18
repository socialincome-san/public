import { Button } from '@/components/button';
import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';

type Props = { params: Promise<{ programId: string }> };

export default async function SurveysPageProgramScoped({ params }: Props) {
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
			actions={<Button>Add new survey</Button>}
			hideProgramName
		/>
	);
}
