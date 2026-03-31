'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import { slugify } from '@/lib/utils/string-utils';
import type { ColumnDef } from '@tanstack/react-table';
import { CopyUrlCell } from '../elements/copy-url-cell';

export const makeCampaignColumns = (): ColumnDef<CampaignTableViewRow>[] => {
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
			id: 'newWebsiteLink',
			accessorFn: (row) => {
				const origin = typeof window !== 'undefined' ? window.location.origin : '';
				return `${origin}/de/ch/new-website/campaigns/${slugify(row.title)}`;
			},
			header: (ctx) => <SortableHeader ctx={ctx}>Link</SortableHeader>,
			cell: (ctx) => <CopyUrlCell ctx={ctx} />,
		},
		{
			accessorKey: 'link',
			header: (ctx) => <SortableHeader ctx={ctx}>Legacy link</SortableHeader>,
			cell: (ctx) => <CopyUrlCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableHiding: false,
			cell: (ctx) => (
				<ActionCell ctx={ctx} mode={ctx.row.original.permission === ProgramPermission.operator ? 'edit' : 'view'} />
			),
		},
	];
};
