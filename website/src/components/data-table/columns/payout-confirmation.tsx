'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { PayoutConfirmationActionsCell } from '@/components/data-table/elements/payout-confirmation-actions-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import type { PayoutConfirmationTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';
import { CurrencyCell } from '../elements/currency-cell';

export const makePayoutConfirmationColumns = (): ColumnDef<PayoutConfirmationTableViewRow>[] => [
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Recipient</SortableHeader>,
		accessorFn: (row) => `${row.recipientFirstName} ${row.recipientLastName}`,
		id: 'recipient',
	},
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
		accessorKey: 'programName',
	},
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
		accessorKey: 'amount',
		cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.currency} />,
	},
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
		accessorKey: 'status',
		cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
	},
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Paid at</SortableHeader>,
		accessorKey: 'paymentAt',
		cell: (ctx) => <DateCell ctx={ctx} />,
	},
	{
		header: (ctx) => <SortableHeader ctx={ctx}>Phone</SortableHeader>,
		accessorKey: 'phoneNumber',
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => <PayoutConfirmationActionsCell payout={row.original} />,
		enableSorting: false,
	},
];
