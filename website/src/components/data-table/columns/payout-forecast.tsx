'use client';

import { columnLabel, type ColumnLabelTranslator } from '@/components/data-table/columns/column-label';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { DataTableTranslator } from '@/components/data-table/table-config.types';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { PayoutForecastTableViewRow } from '@/modules/payouts/payout.types';

// Labels are translated only when a translator is given (public program page); the third parameter matches
// `DataTableConfig.makeColumns`.
export const makePayoutForecastColumns = (
	_hideProgramName?: boolean,
	_hideLocalPartner?: boolean,
	_t?: DataTableTranslator,
	translator?: ColumnLabelTranslator,
): ColumnDef<PayoutForecastTableViewRow>[] => {
	return [
		{
			accessorKey: 'period',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-period', 'Period')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'numberOfRecipients',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(translator, 'column-recipients', 'Recipients')}</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amountInProgramCurrency',
			header: (ctx) => {
				const firstRow = ctx.table.options.data?.[0];
				const currencyLabel = firstRow?.programCurrency ? ` (${firstRow.programCurrency})` : '';
				const amountLabel = columnLabel(translator, 'column-amount', 'Amount');

				return <SortableHeader ctx={ctx}>{`${amountLabel}${currencyLabel}`}</SortableHeader>;
			},
			accessorFn: (row) => row.amountInProgramCurrency,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.programCurrency} />,
		},
		{
			id: 'amountUsd',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(translator, 'column-amount-usd', 'Amount (USD)')}</SortableHeader>
			),
			accessorFn: (row) => row.amountUsd,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="USD" />,
		},
	];
};
