'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { OrganizationTableViewRow } from '@socialincome/shared/src/database/services/organization/organization.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeOrganizationColumns(): ColumnDef<OrganizationTableViewRow>[] {
	return [
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'operatedProgramsCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Operated Programs</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'viewedProgramsCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Viewed Programs</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'usersCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Users</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
