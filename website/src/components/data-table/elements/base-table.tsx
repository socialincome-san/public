'use client';

import { TABLE_PAGE_SIZE_OPTIONS } from '@/components/data-table/query-state';
import { type ColumnDef, type VisibilityState } from '@/components/data-table/tanstack-table';
import { DataTablePagination } from '@socialincome/design-system/data-display/data-table-pagination/data-table-pagination';
import { DataTable } from '@socialincome/design-system/data-display/data-table/data-table';
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

	const handlePageSizeChange = (nextPageSize: number) => {
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
		<DataTable
			headerRows={table.getHeaderGroups().map((headerGroup) => ({
				id: headerGroup.id,
				cells: headerGroup.headers.map((header) => ({
					id: header.id,
					content: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()),
				})),
			}))}
			rows={table.getRowModel().rows.map((row) => ({
				id: row.id,
				onClick: onRowClick ? () => onRowClick(row.original) : undefined,
				cells: row.getVisibleCells().map((cell) => ({
					id: cell.id,
					content: flexRender(cell.column.columnDef.cell, cell.getContext()),
				})),
			}))}
			columnCount={columns.length}
			emptyMessage={emptyMessage}
			stableHeight={!compact}
			pagination={
				compact ? null : (
					<DataTablePagination
						startRow={startRow}
						endRow={endRow}
						totalRows={totalRows}
						canPreviousPage={canPreviousPage}
						canNextPage={canNextPage}
						onPreviousPage={goToPreviousPage}
						onNextPage={goToNextPage}
						pageSize={pageSize}
						pageSizeOptions={pageSizeOptions}
						onPageSizeChange={handlePageSizeChange}
						showRowsPerPageSelector={showRowsPerPageSelector}
					/>
				)
			}
		/>
	);
};
