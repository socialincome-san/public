'use client';

import { ProgressCell } from '@/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { OngoingPayoutTableViewRow } from '@/lib/services/payout/payout.types';
import type { ColumnDef, HeaderContext } from '@tanstack/react-table';

function getMonthLabelFromData(ctx: HeaderContext<OngoingPayoutTableViewRow, unknown>, index: number): string {
	const firstRow = ctx.table.options.data[0] as OngoingPayoutTableViewRow | undefined;
	return firstRow?.last3Months[index]?.monthLabel ?? '–';
}

export function makeOngoingPayoutColumns(): ColumnDef<OngoingPayoutTableViewRow>[] {
	return [
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
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>Progress</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			id: 'month1',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 0)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[0]?.status,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
		},
		{
			id: 'month2',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 1)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[1]?.status,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
		},
		{
			id: 'month3',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 2)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[2]?.status,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
		},
	];
}
