'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { DateCell } from '@/app/portal/components/data-table/elements/date-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeCampaignColumns(): ColumnDef<CampaignTableViewRow>[] {
	return [
		{
			accessorKey: 'title',
			header: (ctx) => <SortableHeader ctx={ctx}>Title</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'description',
			header: (ctx) => <SortableHeader ctx={ctx}>Description</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'currency',
			header: (ctx) => <SortableHeader ctx={ctx}>Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'endDate',
			header: (ctx) => <SortableHeader ctx={ctx}>End Date</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'isActive',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="campaign" />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
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
