'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { CurrencyCell } from '@/app/portal/components/data-table/elements/currency-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { PayoutForecastTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makePayoutForecastColumns(): ColumnDef<PayoutForecastTableViewRow>[] {
	return [
		{
			accessorKey: 'period',
			header: (ctx) => <SortableHeader ctx={ctx}>Period</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'numberOfRecipients',
			header: (ctx) => <SortableHeader ctx={ctx}>Recipients</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amountInProgramCurrency',
			header: (ctx) => {
				const firstRow = ctx.table.options.data?.[0];
				const currencyLabel = firstRow?.programCurrency ? ` (${firstRow.programCurrency})` : '';
				return <SortableHeader ctx={ctx}>{`Amount${currencyLabel}`}</SortableHeader>;
			},
			accessorFn: (row) => row.amountInProgramCurrency,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.programCurrency} />,
		},
		{
			id: 'amountUsd',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount (USD)</SortableHeader>,
			accessorFn: (row) => row.amountUsd,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="USD" />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
