'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { AllUsersTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeAllUsersColumns(): ColumnDef<AllUsersTableViewRow>[] {
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
			accessorKey: 'role',
			header: (ctx) => <SortableHeader ctx={ctx}>Role</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'organizations',
			header: (ctx) => <SortableHeader ctx={ctx}>Organizations</SortableHeader>,
			cell: (ctx) => {
				const orgs = ctx.row.original.organizations;
				return <span>{orgs.length ? orgs.join(', ') : '-'}</span>;
			},
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}