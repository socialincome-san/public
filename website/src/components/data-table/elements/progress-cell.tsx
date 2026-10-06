'use client';

import { CellType } from '@/components/data-table/elements/types';
import { DataTableProgressCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const ProgressCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const percent = ctx.getValue() as number;

	const { payoutsReceived, payoutsTotal } = ctx.row.original as {
		payoutsReceived: number;
		payoutsTotal: number;
	};

	const remaining = Math.max(0, (payoutsTotal ?? 0) - (payoutsReceived ?? 0));

	return <DataTableProgressCell percent={percent} received={payoutsReceived} total={payoutsTotal} urgent={remaining <= 4} />;
};
