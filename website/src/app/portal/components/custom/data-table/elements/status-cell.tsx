import { CellType } from '@/app/portal/components/custom/data-table/elements/types';
import { StatusBadge } from '@/app/portal/components/custom/status-badge';
import { RecipientStatus } from '@prisma/client';

export function StatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <StatusBadge status={ctx.getValue() as RecipientStatus} />;
}
