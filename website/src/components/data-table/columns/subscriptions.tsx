'use client';

import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import {
	SUBSCRIPTION_PAYMENT_METHOD_LABELS,
	SUBSCRIPTION_STATUS_LABELS,
	type SubscriptionTableViewRow,
} from '@/lib/services/subscription/subscription.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeSubscriptionsColumns = (): ColumnDef<SubscriptionTableViewRow>[] => {
	return [
		{
			id: 'contributor',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>Contributor</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			accessorFn: (row) => row.amount,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.currency} />,
		},
		{
			accessorKey: 'campaignTitle',
			header: (ctx) => <SortableHeader ctx={ctx}>Campaign</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => (
				<StatusCell ctx={ctx} variant="subscription" label={SUBSCRIPTION_STATUS_LABELS[ctx.row.original.status]} />
			),
		},
		{
			accessorKey: 'paymentMethod',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment method</SortableHeader>,
			cell: (ctx) => (
				<TextCell ctx={ctx} translatedValue={SUBSCRIPTION_PAYMENT_METHOD_LABELS[ctx.row.original.paymentMethod]} />
			),
		},
		{
			accessorKey: 'stripeSubscriptionId',
			header: (ctx) => <SortableHeader ctx={ctx}>Stripe ID</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'bankStandingOrderReference',
			header: (ctx) => <SortableHeader ctx={ctx}>Bank standing-order reference</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	];
};
