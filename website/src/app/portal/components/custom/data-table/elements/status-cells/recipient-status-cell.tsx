import { RecipientStatusBadge } from '@/app/portal/components/custom/badges/recipient-status-badge';
import { CellType } from '@/app/portal/components/custom/data-table/elements/types';
import { RecipientStatus } from '@prisma/client';

export function RecipientStatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <RecipientStatusBadge status={ctx.getValue() as RecipientStatus} />;
}
