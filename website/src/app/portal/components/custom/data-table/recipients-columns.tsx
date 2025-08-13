'use client';

import { Button } from '@/app/portal/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/app/portal/components/ui/dropdown-menu';
import { RecipientTableRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

export const recipientColumns: ColumnDef<RecipientTableRow>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell: ({ getValue }) => <code className="text-xs">{String(getValue())}</code>,
		enableSorting: false,
	},
	{
		accessorKey: 'firstName',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				First name
				<ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" focusable="false" />
			</Button>
		),
	},
	{
		accessorKey: 'lastName',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Last name
				<ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" focusable="false" />
			</Button>
		),
	},
	{
		id: 'actions',
		cell: () => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" aria-hidden="true" focusable="false" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem>Edit</DropdownMenuItem>
					<DropdownMenuItem>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
