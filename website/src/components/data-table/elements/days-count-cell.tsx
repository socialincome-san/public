'use client';

import { CellType } from '@/components/data-table/elements/types';
import { DataTableDaysCountCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const DaysCountCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const rawValue = ctx.getValue();

	return <DataTableDaysCountCell days={typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0)} />;
};
