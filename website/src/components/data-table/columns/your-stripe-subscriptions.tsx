'use client';

import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { Translator } from '@/lib/i18n/translator';
import type { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeYourStripeSubscriptionsColumns(
	_?: boolean,
	translator?: Translator,
): ColumnDef<StripeSubscriptionRow>[] {
	return [
		{
			accessorKey: 'from',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.from')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'until',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.to')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.status-title')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'interval',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.interval')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.amount')}</SortableHeader>,
			cell: (ctx) => {
				const currency = ctx.row.original.currency;
				return <CurrencyCell ctx={ctx} currency={currency} />;
			},
		},
	];
}
