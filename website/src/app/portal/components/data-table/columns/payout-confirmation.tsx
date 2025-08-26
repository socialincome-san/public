'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import { PayoutConfirmationTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makePayoutConfirmationColumns(hideProgramName = false): ColumnDef<PayoutConfirmationTableViewRow>[] {
	const columns: ColumnDef<PayoutConfirmationTableViewRow>[] = [
		{
			accessorKey: 'firstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'lastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'paymentAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment date</SortableHeader>,
			accessorFn: (row) => row.paymentAt,
			cell: (ctx) => {
				const row = ctx.row.original;
				return <span>{row.paymentAtFormatted}</span>;
			},
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
		},
	];

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push({
		id: 'actions',
		header: '',
		enableSorting: false,
		cell: (ctx) => <ActionCell ctx={ctx} />,
	});

	return columns;
}
