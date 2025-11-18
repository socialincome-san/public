import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';

export default async function UpcomingSurveysPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new SurveyService();
	const result = await service.getUpcomingSurveyTableView(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Upcoming Surveys"
			error={error}
			emptyMessage="No upcoming surveys found"
			data={rows}
			makeColumns={makeSurveyColumns}
		/>
	);
}
