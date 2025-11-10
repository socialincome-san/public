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
	options = {},
}: DateCellProps<TData, TValue>) {
	const value = ctx.getValue();

	if (!value) {
		return <span>-</span>;
	}

	const date = value instanceof Date ? value : new Date(value);
	const formatted = new Intl.DateTimeFormat(locale, options).format(date);

	return <span>{formatted}</span>;
}
