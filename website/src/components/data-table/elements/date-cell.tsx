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

	let date: Date | null = null;
	if (value instanceof Date) {
		date = value;
	} else if (typeof value === 'string' || typeof value === 'number') {
		date = new Date(value);
	}
	if (!date || Number.isNaN(date.getTime())) {
		return <span>-</span>;
	}
	const formatted = new Intl.DateTimeFormat(locale, options).format(date);

	return <span>{formatted}</span>;
};
