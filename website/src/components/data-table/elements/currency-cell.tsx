'use client';

import { type CellContext } from '@/components/data-table/tanstack-table';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { DataTableValueCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

type CurrencyCellProps<TData extends RowData, TValue> = {
	ctx: CellContext<TData, TValue>;
	currency?: string;
};

export const CurrencyCell = <TData extends RowData, TValue>({ ctx, currency = 'CHF' }: CurrencyCellProps<TData, TValue>) => {
	const value = ctx.getValue() as number | null;

	return (
		<DataTableValueCell
			value={
				value === null || isNaN(value)
					? null
					: formatCurrencyLocale(value, currency, 'de-CH', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})
			}
		/>
	);
};
