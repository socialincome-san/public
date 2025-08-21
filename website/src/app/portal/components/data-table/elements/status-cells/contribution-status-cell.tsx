import { ContributionStatusBadge } from '@/app/portal/components/badges/contribution-status-badge';
import { CellType } from '@/app/portal/components/data-table/elements/types';
import { ContributionStatus } from '@prisma/client';

export function ContributionStatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <ContributionStatusBadge status={ctx.getValue() as ContributionStatus} />;
}
