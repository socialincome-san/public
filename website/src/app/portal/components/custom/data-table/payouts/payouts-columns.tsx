'use client';

import { ActionCell } from '@/app/portal/components/custom/data-table/elements/action-cell';
import { PayoutStatusCell } from '@/app/portal/components/custom/data-table/elements/payout-status-cell';
import { ProgressCell } from '@/app/portal/components/custom/data-table/elements/progress-cell';
import { SortableHeader } from '@/app/portal/components/custom/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/custom/data-table/elements/text-cell';
import { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makePayoutsColumns(monthLabels?: [string, string, string]): ColumnDef<PayoutTableViewRow>[] {
	const [m0, m1, m2] = monthLabels ?? ['This month', 'Prev month', '2 mo ago'];

	return [
		{ accessorKey: 'id', header: 'ID', cell: (ctx) => <TextCell ctx={ctx} /> },
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
			accessorKey: 'gender',
			header: (ctx) => <SortableHeader ctx={ctx}>Gender</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>% Progress</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			id: 'm0',
			header: (ctx) => <SortableHeader ctx={ctx}>{m0}</SortableHeader>,
			accessorFn: (row) => row.last3Months[0]?.status ?? null,
			cell: (ctx) => <PayoutStatusCell ctx={ctx} />,
			enableSorting: false,
		},
		{
			id: 'm1',
			header: (ctx) => <SortableHeader ctx={ctx}>{m1}</SortableHeader>,
			accessorFn: (row) => row.last3Months[1]?.status ?? null,
			cell: (ctx) => <PayoutStatusCell ctx={ctx} />,
			enableSorting: false,
		},
		{
			id: 'm2',
			header: (ctx) => <SortableHeader ctx={ctx}>{m2}</SortableHeader>,
			accessorFn: (row) => row.last3Months[2]?.status ?? null,
			cell: (ctx) => <PayoutStatusCell ctx={ctx} />,
			enableSorting: false,
		},

		{
			id: 'actions',
			header: 'Actions',
			enableSorting: false,
			cell: (ctx) => {
				const row = ctx.row.original;
				return <ActionCell ctx={ctx} readOnly={row.permission !== 'operator'} />;
			},
		},
	];
}
