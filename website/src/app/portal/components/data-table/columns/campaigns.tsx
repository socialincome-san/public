'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeCampaignColumns(hideProgramName?: boolean): ColumnDef<CampaignTableViewRow>[] {
	const columns: ColumnDef<CampaignTableViewRow>[] = [
		{
			accessorKey: 'title',
			header: (ctx) => <SortableHeader ctx={ctx}>Title</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'creatorName',
			header: (ctx) => <SortableHeader ctx={ctx}>Creator Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'creatorEmail',
			header: (ctx) => <SortableHeader ctx={ctx}>Creator Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="campaign" />,
		},
		{
			accessorKey: 'goal',
			header: (ctx) => <SortableHeader ctx={ctx}>Goal</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'currency',
			header: (ctx) => <SortableHeader ctx={ctx}>Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'endDateFormatted',
			header: (ctx) => <SortableHeader ctx={ctx}>End Date</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push({
		id: 'actions',
		header: 'Actions',
		enableSorting: false,
		cell: (ctx) => {
			const row = ctx.row.original as CampaignTableViewRow & { permission?: string };
			return <ActionCell ctx={ctx} readOnly={row.permission !== 'operator'} />;
		},
	});

	return columns;
}
