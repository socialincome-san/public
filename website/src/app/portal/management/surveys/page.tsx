import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { SurveyService } from '@/lib/services/survey/survey.service';
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

  const service = new SurveyService();
  const result = await service.getTableView(user.id);

  const error = result.success ? null : result.error;
  const rows: SurveyTableViewRow[] = result.success ? result.data.tableRows : [];

  return <SurveysTableClient rows={rows} error={error} />;
};
