'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { ContributionStatusCell } from '@/app/portal/components/data-table/elements/status-cells/contribution-status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { ContributionTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeContributionsColumns(): ColumnDef<ContributionTableViewRow>[] {
	return [
		{
			accessorKey: 'source',
			header: (ctx) => <SortableHeader ctx={ctx}>Source</SortableHeader>,
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
			cell: (ctx) => <ContributionStatusCell ctx={ctx} />,
		},
		{
			accessorKey: 'campaignName',
			header: (ctx) => <SortableHeader ctx={ctx}>Campaign</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'interval',
			header: (ctx) => <SortableHeader ctx={ctx}>Interval</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAtFormatted',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
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
