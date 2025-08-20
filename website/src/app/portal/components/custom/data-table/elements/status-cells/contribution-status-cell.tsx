import { ContributionStatusBadge } from '@/app/portal/components/custom/badges/contribution-status-badge';
import { CellType } from '@/app/portal/components/custom/data-table/elements/types';
import { ContributionStatus } from '@prisma/client';

export function ContributionStatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <ContributionStatusBadge status={ctx.getValue() as ContributionStatus} />;
}
