import { CellType } from '@/app/portal/components/custom/data-table/columns/helper/types';

export function ProgressCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const percent = ctx.getValue() as number;

	const { payoutsReceived, payoutsTotal } = ctx.row.original as {
		payoutsReceived: number;
		payoutsTotal: number;
	};

	return (
		<div>
			<progress value={percent} max={100}></progress>
			<div>
				{payoutsReceived} / {payoutsTotal}
			</div>
		</div>
	);
}
