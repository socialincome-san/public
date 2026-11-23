'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { EmailCatalogEntry } from '@/modules/mail/mail.types';

export const makeEmailCatalogColumns = (): ColumnDef<EmailCatalogEntry>[] => [
	{
		accessorKey: 'name',
		header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'status',
		header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'source',
		header: (ctx) => <SortableHeader ctx={ctx}>Sent by</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'audience',
		header: (ctx) => <SortableHeader ctx={ctx}>Audience</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'category',
		header: (ctx) => <SortableHeader ctx={ctx}>Category</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'trigger',
		header: 'When',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'languages',
		accessorFn: (row) => row.languages.join(', '),
		header: 'Languages',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'sentCount',
		header: (ctx) => <SortableHeader ctx={ctx}>Sent</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'problemCount30Days',
		header: (ctx) => <SortableHeader ctx={ctx}>Problems (30 days)</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'lastSentAt',
		header: (ctx) => <SortableHeader ctx={ctx}>Last sent</SortableHeader>,
		cell: (ctx) => <DateCell ctx={ctx} options={{ dateStyle: 'short', timeStyle: 'short' }} />,
	},
];
