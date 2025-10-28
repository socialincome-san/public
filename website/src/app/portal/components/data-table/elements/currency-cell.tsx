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

	const formatted = new Intl.NumberFormat('de-CH', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

	return <span>{formatted}</span>;
}
