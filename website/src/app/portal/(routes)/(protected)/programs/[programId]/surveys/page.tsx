import { Button } from '@/app/portal/components/button';
import { makeSurveyColumns } from '@/app/portal/components/data-table/columns/surveys';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';

type Props = { params: Promise<{ programId: string }> };

export default async function SurveysPageProgramScoped({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const surveyService = new SurveyService();
	const programService = new ProgramService();

	const [surveysResult, programPermissionResult] = await Promise.all([
		surveyService.getSurveyTableViewProgramScoped(user.id, programId),
		programService.getProgramPermissionForUser(user.id, programId),
	]);

	const error = surveysResult.success ? null : surveysResult.error;
	const rows: SurveyTableViewRow[] = surveysResult.success ? surveysResult.data.tableRows : [];
	const userIsOperator = programPermissionResult.success && programPermissionResult.data === 'operator';

	return (
		<DataTable
			title="Surveys"
			error={error}
			emptyMessage="No surveys found"
			data={rows}
			makeColumns={makeSurveyColumns}
			actions={<Button disabled={!userIsOperator}>Add new survey</Button>}
			hideProgramName
		/>
	);
}
