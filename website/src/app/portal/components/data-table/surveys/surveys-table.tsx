'use client';

import { DataTable } from '@/app/portal/components/data-table/data-table';
import { makeSurveyColumns } from '@/app/portal/components/data-table/surveys/surveys-columns';
import { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';

type SurveysTableProps = {
	data: SurveyTableViewRow[];
};

export default function SurveysTable({ data }: SurveysTableProps) {
	const columns = makeSurveyColumns();
	return <DataTable data={data} columns={columns} />;
}
