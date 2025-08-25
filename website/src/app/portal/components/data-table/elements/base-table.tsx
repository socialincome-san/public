// app/portal/components/data-table/elements/base-table.tsx
'use client';

import { Button } from '@/app/portal/components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/portal/components/table';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

type BaseTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onRowClick?: (row: TData) => void;
};

export function BaseTable<TData, TValue>({ columns, data, onRowClick }: BaseTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: { sorting },
	});

	const pageSize = table.getState().pagination.pageSize;
	const pageIndex = table.getState().pagination.pageIndex;
	const totalRows = data.length;

	const startRow = pageIndex * pageSize + 1;
	const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

	return (
		<div>
			<div className="overflow-hidden rounded-none">
				<Table className="w-full border-separate border-spacing-0">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="bg-accent">
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="border-b font-medium">
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className={`group h-16 transition-colors duration-200 ease-out ${
										onRowClick ? 'hover:bg-accent/60 cursor-pointer' : ''
									}`}
									onClick={onRowClick ? () => onRowClick(row.original) : undefined}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="border-b">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow className="h-16">
								<TableCell colSpan={columns.length} className="border-b text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-4 py-4">
				<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					Previous
				</Button>
				<span className="text-muted-foreground text-sm">
					{startRow}-{endRow} of {totalRows}
				</span>
				<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					Next
				</Button>
			</div>
		</div>
	);
}
