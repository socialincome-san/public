'use client';

import { ActionCell } from '@/app/portal/components/custom/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/custom/data-table/elements/sortable-header';
import { SurveyStatusCell } from '@/app/portal/components/custom/data-table/elements/status-cells/survey-status-cell';
import { TextCell } from '@/app/portal/components/custom/data-table/elements/text-cell';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeSurveyColumns(): ColumnDef<SurveyTableViewRow>[] {
	return [
		{
			accessorKey: 'questionnaire',
			header: (ctx) => <SortableHeader ctx={ctx}>Questionnaire</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <SurveyStatusCell ctx={ctx} />,
		},
		{
			accessorKey: 'recipientName',
			header: (ctx) => <SortableHeader ctx={ctx}>Recipient</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'language',
			header: (ctx) => <SortableHeader ctx={ctx}>Language</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'dueDateAtFormatted',
			header: (ctx) => <SortableHeader ctx={ctx}>Due Date</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'sentAtFormatted',
			header: (ctx) => <SortableHeader ctx={ctx}>Sent Date</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
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
