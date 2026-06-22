'use client';

import { columnLabel } from '@/components/data-table/columns/column-label';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { Translator } from '@/lib/i18n/translator';
import type { PayoutForecastTableViewRow } from '@/lib/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makePayoutForecastColumns = (
	_hideProgramName?: boolean,
	_hideLocalPartner?: boolean,
	translator?: Translator,
	localizeLabels = false,
): ColumnDef<PayoutForecastTableViewRow>[] => {
	return [
		{
			accessorKey: 'period',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-period', 'Period')}</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'numberOfRecipients',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{columnLabel(localizeLabels, translator, 'column-recipients', 'Recipients')}
				</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amountInProgramCurrency',
			header: (ctx) => {
				const firstRow = ctx.table.options.data?.[0];
				const currencyLabel = firstRow?.programCurrency ? ` (${firstRow.programCurrency})` : '';
				const amountLabel = columnLabel(localizeLabels, translator, 'column-amount', 'Amount');

				return <SortableHeader ctx={ctx}>{`${amountLabel}${currencyLabel}`}</SortableHeader>;
			},
			accessorFn: (row) => row.amountInProgramCurrency,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.programCurrency} />,
		},
		{
			id: 'amountUsd',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{columnLabel(localizeLabels, translator, 'column-amount-usd', 'Amount (USD)')}
				</SortableHeader>
			),
			accessorFn: (row) => row.amountUsd,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="USD" />,
		},
	];
};
