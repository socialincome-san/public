'use client';

import { TABLE_PAGE_SIZE_OPTIONS } from '@/components/data-table/query-state';
import { type ColumnDef, type VisibilityState } from '@/components/data-table/tanstack-table';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { flexRender, functionalUpdate, type RowData, type SortingState } from '@tanstack/react-table';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useLegacyTable } from '@tanstack/react-table/legacy';
import { useState } from 'react';

type BaseTableProps<TData extends RowData> = {
	columns: ColumnDef<TData>[];
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
	compact?: boolean;
	emptyMessage?: string;
};

export const BaseTable = <TData extends RowData>({
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
	compact = false,
	emptyMessage = 'No results.',
}: BaseTableProps<TData>) => {
	const stableTableMinHeightClass = compact ? undefined : 'min-h-[680px] md:min-h-[760px]';
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
	const activeServerPagination = serverPagination ?? null;
	const isServerPagination = activeServerPagination !== null;
	const activeServerSorting = serverSorting ?? null;
	const isServerSorting = activeServerSorting !== null;
	const resolvedColumnVisibility = columnVisibility ?? internalColumnVisibility;
	const resolvedSorting = isServerSorting ? activeServerSorting.sorting : sorting;
	const useClientPagination = !isServerPagination && !compact;

	const table = useLegacyTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: useClientPagination ? getPaginationRowModel() : undefined,
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
				pageIndex: 0,
				pageSize: compact ? Math.max(data.length, 1) : 10,
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
		<div className={cn('flex flex-col', stableTableMinHeightClass)} data-testid="data-table-base">
			<div className="overflow-hidden rounded-none">
				<Table size="lg">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} onClick={onRowClick ? () => onRowClick(row.original) : undefined}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length}>
									<div className="text-center">{emptyMessage}</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{compact ? null : (
				<div className="mt-auto flex items-center justify-between gap-4 py-4" data-testid="data-table-pagination">
					<div className="flex items-center gap-2">
						{showRowsPerPageSelector ? (
							<>
								<span className="text-muted-foreground text-sm">Rows per page</span>
								<Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
									<div className="w-20">
										<SelectTrigger size="sm" data-testid="data-table-page-size-trigger">
											<SelectValue />
										</SelectTrigger>
									</div>
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
							data-testid="data-table-pagination-previous"
						>
							Previous
						</Button>
						<span className="text-muted-foreground text-sm" data-testid="data-table-pagination-range">
							{startRow}-{endRow} of {totalRows}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={goToNextPage}
							disabled={!canNextPage}
							data-testid="data-table-pagination-next"
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
