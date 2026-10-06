'use client';

import { CellType } from '@/components/data-table/elements/types';
import { DataTableCopyUrlCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const CopyUrlCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => (
	<DataTableCopyUrlCell url={String(ctx.getValue() ?? '')} />
);
