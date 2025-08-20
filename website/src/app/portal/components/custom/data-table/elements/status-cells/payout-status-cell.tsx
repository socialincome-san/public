import { PayoutStatusBadge } from '@/app/portal/components/custom/badges/payout-status-badge';
import { CellType } from '@/app/portal/components/custom/data-table/elements/types';
import { PayoutStatus } from '@prisma/client';

export function PayoutStatusCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	return <PayoutStatusBadge status={ctx.getValue() as PayoutStatus} />;
}
