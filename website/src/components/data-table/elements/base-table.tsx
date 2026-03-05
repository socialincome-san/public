'use client';

import { Button } from '@/components/button';
import { TABLE_PAGE_SIZE_OPTIONS } from '@/components/data-table/query-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { cn } from '@socialincome/ui';
import {
	ColumnDef,
	VisibilityState,
	flexRender,
	functionalUpdate,
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
	initialSorting?: SortingState;
	pageSizeOptions?: number[];
	showRowsPerPageSelector?: boolean;
	columnVisibility?: VisibilityState;
	onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void;
	serverPagination?: {
		page: number;
		pageSize: number;
		totalRows: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	};
	serverSorting?: {
		sorting: SortingState;
		onSortingChange: (sorting: SortingState) => void;
	};
};

export const BaseTable = <TData, TValue>({
	columns,
	data,
	onRowClick,
	initialSorting = [],
	pageSizeOptions = [...TABLE_PAGE_SIZE_OPTIONS],
	showRowsPerPageSelector = true,
	columnVisibility,
	onColumnVisibilityChange,
	serverPagination,
	serverSorting,
}: BaseTableProps<TData, TValue>) => {
	const stableTableMinHeightClass = 'min-h-[680px] md:min-h-[760px]';
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
	const activeServerPagination = serverPagination ?? null;
	const isServerPagination = activeServerPagination !== null;
	const activeServerSorting = serverSorting ?? null;
	const isServerSorting = activeServerSorting !== null;
	const resolvedColumnVisibility = columnVisibility ?? internalColumnVisibility;
	const resolvedSorting = isServerSorting ? activeServerSorting.sorting : sorting;

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
		onSortingChange: (next) => {
			const resolved = functionalUpdate(next, resolvedSorting);
			if (isServerSorting) {
				activeServerSorting.onSortingChange(resolved);
				return;
			}
			setSorting(resolved);
		},
		onColumnVisibilityChange: (next) => {
			const resolved = functionalUpdate(next, resolvedColumnVisibility);
			setInternalColumnVisibility(resolved);
			onColumnVisibilityChange?.(resolved);
		},
		getSortedRowModel: isServerSorting ? undefined : getSortedRowModel(),
		manualSorting: isServerSorting,
		state: { sorting: resolvedSorting, columnVisibility: resolvedColumnVisibility },
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	const pageSize = isServerPagination ? activeServerPagination.pageSize : table.getState().pagination.pageSize;
	const pageIndex = isServerPagination ? activeServerPagination.page - 1 : table.getState().pagination.pageIndex;
	const totalRows = isServerPagination ? activeServerPagination.totalRows : data.length;

	const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
	const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);
	const canPreviousPage = isServerPagination ? activeServerPagination.page > 1 : table.getCanPreviousPage();
	const canNextPage = isServerPagination ? endRow < totalRows : table.getCanNextPage();

	const handlePageSizeChange = (value: string) => {
		const nextPageSize = Number(value);
		if (isServerPagination) {
			activeServerPagination.onPageSizeChange(nextPageSize);
			return;
		}
		table.setPageSize(nextPageSize);
	};

	const goToPreviousPage = () => {
		if (isServerPagination) {
			activeServerPagination.onPageChange(activeServerPagination.page - 1);
			return;
		}
		table.previousPage();
	};

	const goToNextPage = () => {
		if (isServerPagination) {
			activeServerPagination.onPageChange(activeServerPagination.page + 1);
			return;
		}
		table.nextPage();
	};

	return (
		<div className={cn('flex flex-col', stableTableMinHeightClass)}>
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
									className={cn(
										'group h-16 border-b transition-colors duration-200 ease-out',
										onRowClick && 'hover:bg-accent/60 cursor-pointer',
									)}
									onClick={() => onRowClick?.(row.original)}
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

			<div className="mt-auto flex items-center justify-between gap-4 py-4">
				<div className="flex items-center gap-2">
					{showRowsPerPageSelector ? (
						<>
							<span className="text-muted-foreground text-sm">Rows per page</span>
							<Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
								<SelectTrigger className="h-8 w-[80px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{pageSizeOptions.map((size) => (
										<SelectItem key={size} value={`${size}`}>
											{size}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</>
					) : null}
				</div>

				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="sm"
						onClick={goToPreviousPage}
						disabled={!canPreviousPage}
					>
						Previous
					</Button>
					<span className="text-muted-foreground text-sm">
						{startRow}-{endRow} of {totalRows}
					</span>
					<Button variant="outline" size="sm" onClick={goToNextPage} disabled={!canNextPage}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
