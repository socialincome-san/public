import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@socialincome/shared/src/database/services/survey/survey.service';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';
import { SurveysTableClient } from './surveys-table-client';

export default async function SurveysPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new SurveyService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: SurveyTableViewRow[] = result.success ? result.data.tableRows : [];

	return <SurveysTableClient rows={rows} error={error} />;
}
