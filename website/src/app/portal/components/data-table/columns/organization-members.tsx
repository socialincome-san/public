'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { OrganizationMembersTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeOrganizationMembersColumns(): ColumnDef<OrganizationMembersTableViewRow>[] {
	return [
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
			accessorKey: 'permission',
			header: (ctx) => <SortableHeader ctx={ctx}>Organization Permission</SortableHeader>,
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
