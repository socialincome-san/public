'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makePayoutColumns = (): ColumnDef<PayoutTableViewRow>[] => {
	return [
		{
			accessorKey: 'recipientFirstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'recipientLastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			accessorFn: (row) => row.amount,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.currency} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
		},
		{
			accessorKey: 'paymentAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment Date</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
