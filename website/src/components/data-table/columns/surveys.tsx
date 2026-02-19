'use client';

import { CopyUrlCell } from '@/components/data-table/elements/copy-url-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeSurveyColumns = (hideProgramName = false): ColumnDef<SurveyTableViewRow>[] => {
	const columns: ColumnDef<SurveyTableViewRow>[] = [
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'recipientName',
			header: (ctx) => <SortableHeader ctx={ctx}>Recipient</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'questionnaire',
			header: (ctx) => <SortableHeader ctx={ctx}>Questionnaire</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'language',
			header: (ctx) => <SortableHeader ctx={ctx}>Language</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="survey" />,
		},
		{
			accessorKey: 'dueAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Due Date</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'completedAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Completed</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'surveyUrl',
			header: 'Copy URL',
			enableSorting: false,
			cell: (ctx) => <CopyUrlCell ctx={ctx} />,
		},
	];

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	return columns;
}
