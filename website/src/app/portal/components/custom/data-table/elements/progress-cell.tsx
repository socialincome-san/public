'use client';

import { CellType } from '@/app/portal/components/custom/data-table/elements/types';
import { Progress } from '@/app/portal/components/ui/progress'; // adjust path if needed

export function ProgressCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const percent = ctx.getValue() as number;

	const { payoutsReceived, payoutsTotal } = ctx.row.original as {
		payoutsReceived: number;
		payoutsTotal: number;
	};

	return (
		<div className="flex items-center gap-2">
			<Progress value={percent} className="flex-1" />
			<span className="whitespace-nowrap">
				{payoutsReceived} / {payoutsTotal}
			</span>
		</div>
	);
}
