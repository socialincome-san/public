import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import { Suspense } from 'react';
import { SurveysTableClient } from './surveys-table-client';

export default function SurveysPage() {
	return (
		<Suspense>
			<SurveysDataLoader />
		</Suspense>
	);
}

const SurveysDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.survey.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: SurveyTableViewRow[] = result.success ? result.data.tableRows : [];

	return <SurveysTableClient rows={rows} error={error} />;
};
