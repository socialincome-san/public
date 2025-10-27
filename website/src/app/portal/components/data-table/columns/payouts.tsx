'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { DateCell } from '@/app/portal/components/data-table/elements/date-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makePayoutColumns(): ColumnDef<PayoutTableViewRow>[] {
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
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'currency',
			header: (ctx) => <SortableHeader ctx={ctx}>Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
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
