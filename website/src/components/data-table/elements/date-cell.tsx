'use client';

import { type CellContext } from '@/components/data-table/tanstack-table';
import { DataTableDateCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

type DateCellProps<TData extends RowData> = {
	ctx: CellContext<TData, unknown>;
	locale?: string;
	options?: Intl.DateTimeFormatOptions;
};

export const DateCell = <TData extends RowData>({
	ctx,
	locale = 'de-CH',
	options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	},
}: DateCellProps<TData>) => {
	const value = ctx.getValue();

	const date =
		value instanceof Date ? value : typeof value === 'string' || typeof value === 'number' ? new Date(value) : null;
	const formattedDate =
		value && date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat(locale, options).format(date) : undefined;

	return <DataTableDateCell formattedDate={formattedDate} />;
};
