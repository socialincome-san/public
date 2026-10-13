'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import { sourceLabels, summarizeRecipientChange } from '@/components/recipient-changes/recipient-change-summary';
import type { RecipientChangeTableViewRow } from '@/modules/recipients/recipient.types';

export const makeRecipientChangeColumns = (): ColumnDef<RecipientChangeTableViewRow>[] => [
	{
		accessorKey: 'createdAt',
		header: 'Date',
		cell: (ctx) => <DateCell ctx={ctx} options={{ dateStyle: 'short', timeStyle: 'short' }} />,
	},
	{
		accessorKey: 'recipientName',
		header: 'Recipient',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'programName',
		header: 'Program',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'changes',
		accessorFn: summarizeRecipientChange,
		header: 'Changes',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'actorName',
		header: 'Changed by',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'source',
		header: 'Source',
		cell: (ctx) => <TextCell ctx={ctx} translatedValue={sourceLabels[ctx.row.original.source]} />,
	},
];
