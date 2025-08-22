'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { CopyUrlCell } from '@/app/portal/components/data-table/elements/copy-url-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { UpcomingSurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeUpcomingSurveyColumns(hideProgramName = false): ColumnDef<UpcomingSurveyTableViewRow>[] {
	const columns: ColumnDef<UpcomingSurveyTableViewRow>[] = [
		{
			accessorKey: 'firstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'lastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'questionnaire',
			header: (ctx) => <SortableHeader ctx={ctx}>Questionnaire</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'dueDateAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Due date</SortableHeader>,
			accessorFn: (row) => row.dueDateAt,
			cell: (ctx) => <span>{ctx.row.original.dueDateAtFormatted}</span>,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="survey" />,
		},
		{
			accessorKey: 'url',
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

	columns.push({
		id: 'actions',
		header: 'Actions',
		enableSorting: false,
		cell: (ctx) => {
			const row = ctx.row.original;
			return <ActionCell ctx={ctx} readOnly={row.permission !== 'operator'} />;
		},
	});

	return columns;
}
