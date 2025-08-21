import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import SurveysTable from '@/app/portal/components/custom/data-table/surveys/surveys-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';

export default async function SurveysPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new SurveyService();
	const result = await service.getSurveyTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper title="Surveys" error={error} isEmpty={!rows.length} emptyMessage="No surveys found.">
			<SurveysTable data={rows} />
		</TableWrapper>
	);
}
