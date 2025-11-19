'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { OrganizationTableViewRow } from '@socialincome/shared/src/database/services/organization/organization.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeOrganizationAdminColumns(): ColumnDef<OrganizationTableViewRow>[] {
	return [
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'ownedProgramsCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Programs</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'usersCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Users</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	];
}
