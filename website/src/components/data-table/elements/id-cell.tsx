'use client';

import { CellType } from '@/components/data-table/elements/types';
import { DataTableIdCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const IdCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const value = ctx.getValue();

	return <DataTableIdCell id={value ? String(value) : ''} />;
};
