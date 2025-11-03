'use client';

import { PayoutConfirmationActionsCell } from '@/app/portal/components/data-table/elements/payout-confirmation-actions-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import type { PayoutConfirmationTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CurrencyCell } from '../elements/currency-cell';

export const makePayoutConfirmationColumns = (): ColumnDef<PayoutConfirmationTableViewRow>[] => [
	{
		header: 'Recipient',
		accessorKey: 'recipientFirstName',
		cell: ({ row }) => `${row.original.recipientFirstName} ${row.original.recipientLastName}`,
	},
	{
		header: 'Program',
		accessorKey: 'programName',
	},
	{
		header: 'Amount',
		accessorKey: 'amount',
		cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.currency} />,
	},
	{
		accessorKey: 'status',
		header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
		cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
	},
	{
		header: 'Paid at',
		accessorKey: 'paymentAt',
		cell: ({ row }) => format(row.original.paymentAt, 'yyyy-MM-dd'),
	},
	{
		header: 'Phone',
		accessorKey: 'phoneNumber',
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => <PayoutConfirmationActionsCell payout={row.original} />,
	},
];
