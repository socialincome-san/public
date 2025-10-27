import { makeSurveyColumns } from '@/app/portal/components/data-table/columns/surveys';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';

export default async function SurveysPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new SurveyService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: SurveyTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Surveys"
			error={error}
			emptyMessage="No surveys found."
			data={rows}
			makeColumns={makeSurveyColumns}
		/>
	);
}
