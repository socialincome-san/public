'use client';

import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { OrganizationMemberTableViewRow } from '@socialincome/shared/src/database/services/organization/organization.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeOrganizationMemberColumns(): ColumnDef<OrganizationMemberTableViewRow>[] {
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
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'role',
			header: (ctx) => <SortableHeader ctx={ctx}>Role</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'permission',
			header: (ctx) => <SortableHeader ctx={ctx}>Permission</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];
}
