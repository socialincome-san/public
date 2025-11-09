'use client';

import { CellContext } from '@tanstack/react-table';

type CurrencyCellProps<TData, TValue> = {
	ctx: CellContext<TData, TValue>;
	currency?: string;
};

export function CurrencyCell<TData, TValue>({ ctx, currency = 'CHF' }: CurrencyCellProps<TData, TValue>) {
	const value = ctx.getValue() as number | null;

	if (value == null || isNaN(value)) {
		return <span className="text-muted-foreground">–</span>;
	}

	let formatted: string;

	try {
		formatted = new Intl.NumberFormat('de-CH', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		formatted = `${new Intl.NumberFormat('de-CH', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)} ${currency}`;
	}

	return <span>{formatted}</span>;
}
