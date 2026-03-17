'use client';

import { CellContext } from '@tanstack/react-table';

type DateCellProps<TData> = {
	ctx: CellContext<TData, unknown>;
	locale?: string;
	options?: Intl.DateTimeFormatOptions;
};

export const DateCell = <TData,>({
	ctx,
	locale = 'de-CH',
	options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	},
}: DateCellProps<TData>) => {
	const value = ctx.getValue();

	if (!value) {
		return <span>-</span>;
	}

	const date =
		value instanceof Date ? value : typeof value === 'string' || typeof value === 'number' ? new Date(value) : null;
	if (!date || Number.isNaN(date.getTime())) {
		return <span>-</span>;
	}
	const formatted = new Intl.DateTimeFormat(locale, options).format(date);

	return <span>{formatted}</span>;
};
