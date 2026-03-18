'use client';

import { OrganizationPermissionBadge } from '@/components/badges/organization-permission-badge';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeOrganizationMemberColumns = (): ColumnDef<OrganizationMemberTableViewRow>[] => {
	return [
		{
			id: 'member',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>Member</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'permission',
			header: (ctx) => <SortableHeader ctx={ctx}>Permission</SortableHeader>,
			cell: ({ row }) => <OrganizationPermissionBadge permission={row.original.permission} />,
		},
	];
};
