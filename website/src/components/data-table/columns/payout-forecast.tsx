'use client';

import { columnLabel, type ColumnLabelTranslator } from '@/components/data-table/columns/column-label';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { DataTableTranslator } from '@/components/data-table/table-config.types';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatDateLocale } from '@/lib/utils/string-utils';
import type { PayoutForecastTableViewRow } from '@/modules/payouts/payout.types';

export const formatPayoutForecastPeriod = (period: string, lang: WebsiteLanguage): string => {
	const match = /^(\d{4})-(\d{2})$/.exec(period);
	const year = Number(match?.[1]);
	const month = Number(match?.[2]);
	if (!match || month < 1 || month > 12) {
		return period;
	}

	return formatDateLocale(new Date(Date.UTC(year, month - 1, 1)), getSafeNumberFormatLocale(lang), {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});
};

// Labels are translated only when a translator is given (public program page); the third parameter matches
// `DataTableConfig.makeColumns`.
export const makePayoutForecastColumns = (
	_hideProgramName?: boolean,
	_hideLocalPartner?: boolean,
	_t?: DataTableTranslator,
	translator?: ColumnLabelTranslator,
	options?: { displayCurrency?: WebsiteCurrency; lang?: WebsiteLanguage },
): ColumnDef<PayoutForecastTableViewRow>[] => {
	const columns: ColumnDef<PayoutForecastTableViewRow>[] = [
		{
			accessorKey: 'period',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-period', 'Period')}</SortableHeader>,
			cell: (ctx) => (
				<TextCell
					ctx={ctx}
					translatedValue={options?.lang ? formatPayoutForecastPeriod(ctx.row.original.period, options.lang) : undefined}
				/>
			),
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
				const currency = options?.displayCurrency ?? firstRow?.programCurrency;
				const currencyLabel = currency ? ` (${currency})` : '';
				const amountLabel = columnLabel(translator, 'column-amount', 'Amount');

				return <SortableHeader ctx={ctx}>{`${amountLabel}${currencyLabel}`}</SortableHeader>;
			},
			accessorFn: (row) => (options?.displayCurrency ? (row.amountInDisplayCurrency ?? null) : row.amountInProgramCurrency),
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={options?.displayCurrency ?? ctx.row.original.programCurrency} />,
		},
	];

	if (!options?.displayCurrency) {
		columns.push({
			id: 'amountUsd',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(translator, 'column-amount-usd', 'Amount (USD)')}</SortableHeader>
			),
			accessorFn: (row) => row.amountUsd,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="USD" />,
		});
	}

	return columns;
};
