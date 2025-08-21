'use client';

import { Button } from '@/app/portal/components/button';
import { CellType } from '@/app/portal/components/data-table/elements/types';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/app/portal/components/dropdown-menu';
import { ChevronRightIcon } from 'lucide-react';

type ActionCellProps<TData, TValue> = CellType<TData, TValue> & {
	readOnly?: boolean;
};

export function ActionCell<TData, TValue>({ ctx, readOnly = false }: ActionCellProps<TData, TValue>) {
	const onEdit = () => {
		if (readOnly) return;
		console.log('Edit action for row:', ctx.row.original);
	};

	const onDelete = () => {
		if (readOnly) return;
		console.log('Delete action for row:', ctx.row.original);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 p-0"
					disabled={readOnly}
					aria-disabled={readOnly}
					title={readOnly ? 'Read-only' : 'Open menu'}
				>
					<span className="sr-only">Open menu</span>
					<ChevronRightIcon className="h-10 w-10" focusable="false" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={onEdit}
					onSelect={(e) => {
						if (readOnly) e.preventDefault();
					}}
					disabled={readOnly}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onDelete}
					onSelect={(e) => {
						if (readOnly) e.preventDefault();
					}}
					disabled={readOnly}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
