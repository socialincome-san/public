'use client';

import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeYourStripeSubscriptionsColumns(): ColumnDef<StripeSubscriptionRow>[] {
	return [
		{
			accessorKey: 'from',
			header: (ctx) => <SortableHeader ctx={ctx}>From</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'until',
			header: (ctx) => <SortableHeader ctx={ctx}>Until</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'interval',
			header: (ctx) => <SortableHeader ctx={ctx}>Interval</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			cell: (ctx) => {
				const currency = ctx.row.original.currency;
				return <CurrencyCell ctx={ctx} currency={currency} />;
			},
		},
	];
}
