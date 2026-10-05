'use client';

import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { OrganizationMemberTableViewRow } from '@/modules/organizations/organization.types';

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
	];
};
