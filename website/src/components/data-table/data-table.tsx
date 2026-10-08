'use client';

import { ActionMenu, type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { TABLE_PAGE_SIZE_OPTIONS, TableQueryState } from '@/components/data-table/query-state';
import { TableFilterConfig, type DataTableTranslator } from '@/components/data-table/table-config.types';
import type { ColumnDef, VisibilityState } from '@/components/data-table/tanstack-table';
import { DATA_TABLE_FETCH_PREFIX_REGEX } from '@/lib/utils/regex';
import { humanizeIdentifier } from '@/lib/utils/string-utils';
import { DataTableHeader } from '@socialincome/design-system/data-display/data-table-header/data-table-header';
import {
	DataTableEmptyState,
	DataTableErrorState,
	DataTableNoResults,
} from '@socialincome/design-system/data-display/data-table-states/data-table-states';
import {
	DataTableToolbar,
	type DataTableSortDirection,
	type DataTableToolbarFilter,
} from '@socialincome/design-system/data-display/data-table-toolbar/data-table-toolbar';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import type { RowData, SortingState } from '@tanstack/react-table';
import { functionalUpdate } from '@tanstack/react-table';
import DOMPurify from 'isomorphic-dompurify';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

type DataTableProps<Row extends RowData> = {
	title: ReactNode;
	titleInfoTooltip?: string;
	error?: string | null;
	emptyMessage: string;
	actionMenuItems?: ActionMenuItem[];
	data: Row[];
	makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, t?: DataTableTranslator) => ColumnDef<Row>[];
	hideProgramName?: boolean;
	hideLocalPartner?: boolean;
	onRowClick?: (row: Row) => void;
	initialSorting?: SortingState;
	searchKeys?: (keyof Row)[];
	sortOptions?: { id: string; label: string }[];
	query?: TableQueryState & { totalRows: number };
	onQueryChange?: (patch: Partial<TableQueryState>, options?: { debounceMs?: number }) => void;
	pageSizeOptions?: number[];
	showRowsPerPageSelector?: boolean;
	showColumnVisibilitySelector?: boolean;
	showEntityIdColumn?: boolean;
	isLoading?: boolean;
	toolbarFilters?: TableFilterConfig[];
};

const formatTableError = (error: string): string => {
	const raw = error.replace(DATA_TABLE_FETCH_PREFIX_REGEX, '').trim();
	if (raw.startsWith('{') && raw.endsWith('}')) {
		try {
			const parsed = JSON.parse(raw) as { name?: string };
			if (parsed.name === 'PrismaClientValidationError') {
				return 'The current search or filter is invalid. Please adjust your query and try again.';
			}
		} catch {
			// Keep fallback below.
		}
	}

	return raw.length > 0 ? raw : 'Something went wrong while loading this table.';
};

export default function DataTable<Row extends RowData>({
	title,
	titleInfoTooltip,
	error,
	emptyMessage,
	actionMenuItems,
	data,
	makeColumns,
	hideProgramName = false,
	hideLocalPartner = false,
	onRowClick,
	initialSorting,
	searchKeys,
	sortOptions = [],
	query,
	onQueryChange,
	pageSizeOptions = [...TABLE_PAGE_SIZE_OPTIONS],
	showRowsPerPageSelector = true,
	showColumnVisibilitySelector = false,
	showEntityIdColumn = true,
	isLoading = false,
	toolbarFilters = [],
}: DataTableProps<Row>) {
	const t = useTranslations('website-me');
	const baseColumns = makeColumns(hideProgramName, hideLocalPartner, t);
	const columns = showEntityIdColumn
		? ([
				{
					id: 'id',
					header: 'ID',
					accessorFn: (row: Row) => {
						const value = (row as { id?: unknown }).id;
						if (typeof value === 'string' || typeof value === 'number') {
							return String(value);
						}

						return '';
					},
					cell: (ctx) => <IdCell ctx={ctx} />,
				},
				...baseColumns,
			] as ColumnDef<Row>[])
		: baseColumns;
	const activeQuery = query ?? null;
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		showEntityIdColumn
			? {
					id: false,
					firebaseAuthUserId: false,
				}
			: {
					firebaseAuthUserId: false,
				},
	);
	const displayedData = data;
	const isDatasetEmpty = activeQuery ? activeQuery.totalRows === 0 : data.length === 0;
	const isEmpty = displayedData.length === 0;
	const resolvedSearchKeys = (searchKeys as string[] | undefined)?.filter(Boolean) ?? [];
	const showControls = !error;

	const onSearchChange = (value: string) => {
		if (!onQueryChange) {
			return;
		}
		onQueryChange(
			{
				search: value.trim(),
				page: 1,
			},
			{ debounceMs: 300 },
		);
	};
	const serverSortingState: SortingState =
		activeQuery?.sortBy && activeQuery.sortDirection
			? [{ id: activeQuery.sortBy, desc: activeQuery.sortDirection === 'desc' }]
			: [];
	const onServerSortingChange = (next: SortingState | ((old: SortingState) => SortingState)) => {
		if (!onQueryChange) {
			return;
		}
		const resolved = functionalUpdate(next, serverSortingState);
		const topSort = resolved[0];
		onQueryChange({
			page: 1,
			sortBy: topSort?.id,
			sortDirection: topSort ? (topSort.desc ? 'desc' : 'asc') : undefined,
		});
	};

	const resolvedToolbarFilters: DataTableToolbarFilter[] =
		onQueryChange && toolbarFilters.length > 0
			? toolbarFilters.map((filter) => ({
					id: filter.id,
					label: filter.label,
					placeholder: filter.placeholder,
					value: filter.value,
					options: filter.options,
					onChange: (value) => {
						const patch: Partial<TableQueryState> = { page: 1 };
						patch[filter.queryKey] = value as never;
						onQueryChange(patch);
					},
				}))
			: [];
	const clearAllToolbarFilters =
		onQueryChange && toolbarFilters.length > 0
			? () => {
					const patch: Partial<TableQueryState> = { page: 1 };
					toolbarFilters.forEach((filter) => {
						patch[filter.queryKey] = undefined;
					});
					onQueryChange(patch);
				}
			: undefined;
	const toolbarColumns = showColumnVisibilitySelector
		? columns
				.map((column) => {
					const hasAccessorKey = 'accessorKey' in column;
					const fallbackId = hasAccessorKey && typeof column.accessorKey === 'string' ? column.accessorKey : column.id;
					if (!fallbackId || column.enableHiding === false) {
						return null;
					}
					const label = typeof column.header === 'string' ? column.header : humanizeIdentifier(String(fallbackId));

					return {
						id: String(fallbackId),
						label,
						visible: columnVisibility[String(fallbackId)] !== false,
						onToggle: (visible: boolean) =>
							setColumnVisibility((previous) => ({
								...previous,
								[String(fallbackId)]: visible,
							})),
					};
				})
				.filter((column): column is NonNullable<typeof column> => Boolean(column))
		: [];
	const onSortToolbarChange = (sortBy?: string, sortDirection?: DataTableSortDirection) => {
		if (!onQueryChange) {
			return;
		}
		onQueryChange({
			page: 1,
			sortBy: sortBy ?? undefined,
			sortDirection: sortBy ? (sortDirection ?? 'asc') : undefined,
		});
	};

	const renderSanitizedEmptyMessage = () => (
		<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}></div>
	);

	return (
		<div data-testid="data-table">
			<DataTableHeader
				title={title}
				count={activeQuery ? activeQuery.totalRows : displayedData.length}
				infoTooltip={titleInfoTooltip}
				toolbar={
					<DataTableToolbar
						showControls={showControls}
						searchKeys={onQueryChange ? resolvedSearchKeys : []}
						searchValue={activeQuery?.search ?? ''}
						onSearchChange={onSearchChange}
						sortOptions={onQueryChange ? sortOptions : []}
						sortBy={activeQuery?.sortBy}
						sortDirection={activeQuery?.sortDirection}
						onSortChange={onSortToolbarChange}
						filters={resolvedToolbarFilters}
						columns={toolbarColumns}
						onClearFilters={clearAllToolbarFilters}
						actions={<ActionMenu items={actionMenuItems} />}
					/>
				}
			/>

			{error ? (
				<DataTableErrorState message={formatTableError(error)} />
			) : isLoading ? (
				<AppLoadingSkeleton message="Loading..." />
			) : isDatasetEmpty ? (
				<DataTableEmptyState message={renderSanitizedEmptyMessage()} />
			) : isEmpty ? (
				<DataTableNoResults message={renderSanitizedEmptyMessage()} />
			) : (
				<BaseTable
					data={displayedData}
					columns={columns}
					onRowClick={onRowClick}
					initialSorting={initialSorting}
					pageSizeOptions={pageSizeOptions}
					showRowsPerPageSelector={showRowsPerPageSelector}
					columnVisibility={columnVisibility}
					onColumnVisibilityChange={setColumnVisibility}
					serverSorting={
						activeQuery && onQueryChange
							? {
									sorting: serverSortingState,
									onSortingChange: onServerSortingChange,
								}
							: undefined
					}
					serverPagination={
						activeQuery && onQueryChange
							? {
									page: activeQuery.page,
									pageSize: activeQuery.pageSize,
									totalRows: activeQuery.totalRows,
									onPageChange: (page) => onQueryChange({ page }),
									onPageSizeChange: (pageSize) => onQueryChange({ page: 1, pageSize }),
								}
							: undefined
					}
				/>
			)}
		</div>
	);
}
