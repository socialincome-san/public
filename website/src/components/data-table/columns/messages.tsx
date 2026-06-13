'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { MessageTableViewRow } from '@/lib/services/messaging/messaging-log.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeMessageColumns = (): ColumnDef<MessageTableViewRow>[] => {
	return [
		{
			accessorKey: 'channel',
			header: (ctx) => <SortableHeader ctx={ctx}>Channel</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'addressee',
			header: (ctx) => <SortableHeader ctx={ctx}>To</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'recipientType',
			header: (ctx) => <SortableHeader ctx={ctx}>Entity Type</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'templateName',
			header: (ctx) => <SortableHeader ctx={ctx}>Template</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'sentAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Sent</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	];
};
