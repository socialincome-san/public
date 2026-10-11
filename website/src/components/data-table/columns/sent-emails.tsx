'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { SentEmailTableViewRow } from '@/modules/mail/mail.types';

export const makeSentEmailColumns = (): ColumnDef<SentEmailTableViewRow>[] => [
	{
		accessorKey: 'sentAt',
		header: (ctx) => <SortableHeader ctx={ctx}>Sent</SortableHeader>,
		cell: (ctx) => <DateCell ctx={ctx} options={{ dateStyle: 'short', timeStyle: 'short' }} />,
	},
	{
		accessorKey: 'toEmail',
		header: (ctx) => <SortableHeader ctx={ctx}>To</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'subject',
		header: (ctx) => <SortableHeader ctx={ctx}>Subject</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'body',
		header: 'Body',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'fromEmail',
		header: (ctx) => <SortableHeader ctx={ctx}>From</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'contact',
		header: (ctx) => <SortableHeader ctx={ctx}>Contact</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
];
