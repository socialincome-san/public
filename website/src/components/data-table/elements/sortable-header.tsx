'use client';

import { DataTableSortHeader } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';
import { HeaderType } from './types';

type Props<TData extends RowData, TValue> = HeaderType<TData, TValue> & {
	sortable?: boolean;
};

export const SortableHeader = <TData extends RowData, TValue>({ ctx, children, sortable = false }: Props<TData, TValue>) => {
	if (!sortable || !ctx.column.getCanSort()) {
		return <span>{children}</span>;
	}

	return (
		<DataTableSortHeader direction={ctx.column.getIsSorted() || undefined} onToggle={() => ctx.column.toggleSorting()}>
			{children}
		</DataTableSortHeader>
	);
};
