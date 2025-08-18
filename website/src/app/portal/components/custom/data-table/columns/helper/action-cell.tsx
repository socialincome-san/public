'use client';

import { CellType } from '@/app/portal/components/custom/data-table/columns/helper/types';
import { Button } from '@/app/portal/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/app/portal/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export function ActionCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const onEdit = () => {
		console.log('Edit action for row:', ctx.row.original);
	};

	const onDelete = () => {
		console.log('Delete action for row:', ctx.row.original);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" focusable="false" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
				<DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
