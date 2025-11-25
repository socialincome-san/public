'use client';

import { CellContext } from '@tanstack/react-table';

type DateCellProps<TData, TValue> = {
	ctx: CellContext<TData, TValue>;
	locale?: string;
	options?: Intl.DateTimeFormatOptions;
};

export function DateCell<TData, TValue extends Date | string | null>({
	ctx,
	locale = 'de-CH',
	options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZone: 'Europe/Zurich',
	},
}: DateCellProps<TData, TValue>) {
	const value = ctx.getValue();

	if (!value) {
		return <span>-</span>;
	}

	const date = value instanceof Date ? value : new Date(value);
	const formatted = new Intl.DateTimeFormat(locale, options).format(date);

	return <span>{formatted}</span>;
}
