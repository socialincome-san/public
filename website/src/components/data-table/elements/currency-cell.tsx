'use client';

import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { CellContext } from '@tanstack/react-table';

type CurrencyCellProps<TData, TValue> = {
	ctx: CellContext<TData, TValue>;
	currency?: string;
};

export const CurrencyCell = <TData, TValue>({ ctx, currency = 'CHF' }: CurrencyCellProps<TData, TValue>) => {
	const value = ctx.getValue() as number | null;

	if (value == null || isNaN(value)) {
		return <span className="text-muted-foreground">–</span>;
	}

	const formatted = formatCurrencyLocale(value, currency, 'de-CH', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return <span>{formatted}</span>;
}
