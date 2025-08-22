'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { ProgressCell } from '@/app/portal/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import { OngoingPayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef, HeaderContext } from '@tanstack/react-table';

function getMonthLabelFromData(ctx: HeaderContext<OngoingPayoutTableViewRow, unknown>, index: number): string {
	const firstRow = ctx.table.options.data[0] as OngoingPayoutTableViewRow | undefined;
	return firstRow?.last3Months[index]?.monthLabel ?? '–';
}

export function makeOngoingPayoutsColumns(hideProgramName = false): ColumnDef<OngoingPayoutTableViewRow>[] {
	const columns: ColumnDef<OngoingPayoutTableViewRow>[] = [
		{
			accessorKey: 'id',
			header: 'ID',
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
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
	];

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>Progress %</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			id: 'currentMonth',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 0)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[0]?.status ?? null,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
			enableSorting: false,
		},
		{
			id: 'previousMonth',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 1)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[1]?.status ?? null,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
			enableSorting: false,
		},
		{
			id: 'twoMonthsAgo',
			header: (ctx) => <SortableHeader ctx={ctx}>{getMonthLabelFromData(ctx, 2)}</SortableHeader>,
			accessorFn: (row) => row.last3Months[2]?.status ?? null,
			cell: (ctx) => <StatusCell ctx={ctx} variant="payout" />,
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
	);

	return columns;
}
