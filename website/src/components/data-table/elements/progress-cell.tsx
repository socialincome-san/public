'use client';

import { CellType } from '@/components/data-table/elements/types';
import { Progress } from '@socialincome/design-system/progress/progress';
import type { RowData } from '@tanstack/react-table';

export const ProgressCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const percent = ctx.getValue() as number;

	const { payoutsReceived, payoutsTotal } = ctx.row.original as {
		payoutsReceived: number;
		payoutsTotal: number;
	};

	const remaining = Math.max(0, (payoutsTotal ?? 0) - (payoutsReceived ?? 0));
	const variant = remaining <= 4 ? 'urgent' : 'default';

	return (
		<div className="flex items-center gap-2">
			<Progress value={percent} variant={variant} />
			<span className="whitespace-nowrap">
				{payoutsReceived} / {payoutsTotal}
			</span>
		</div>
	);
};
