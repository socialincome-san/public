import { SurveyStatusBadge } from '@/app/portal/components/badges/survey-status-badge';
import { CellType } from '@/app/portal/components/data-table/elements/types';
import { SurveyStatus } from '@prisma/client';

export function SurveyStatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <SurveyStatusBadge status={ctx.getValue() as SurveyStatus} />;
}
