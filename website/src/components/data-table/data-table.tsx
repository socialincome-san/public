'use client';

import { type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { DataTableEmptyState } from '@/components/data-table/elements/data-table-empty-state';
import {
	DataTableToolbar,
	type ToolbarFilter,
	type ToolbarSortOption,
} from '@/components/data-table/elements/data-table-toolbar';
import { TABLE_PAGE_SIZE_OPTIONS, TableQueryState } from '@/components/data-table/query-state';
import { TableFilterConfig } from '@/components/data-table/table-config.types';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { humanizeIdentifier } from '@/lib/utils/string-utils';
import { cn } from '@socialincome/ui';
import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table';
import { functionalUpdate } from '@tanstack/react-table';
import DOMPurify from 'isomorphic-dompurify';
import { InfoIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

type DataTableProps<Row> = {
	title: ReactNode;
	titleInfoTooltip?: string;
	error?: string | null;
	emptyMessage: string;
	actionMenuItems?: ActionMenuItem[];
	data: Row[];
	makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, translator?: Translator) => ColumnDef<Row>[];
	hideProgramName?: boolean;
	hideLocalPartner?: boolean;
	onRowClick?: (row: Row) => void;
	initialSorting?: SortingState;
	lang?: WebsiteLanguage;
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
	const raw = error.replace(/^Could not fetch [^:]+:\s*/i, '').trim();
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

	return raw || 'Something went wrong while loading this table.';
};

export default function DataTable<Row>({
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
	lang,
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
	const stableTableMinHeightClass = 'min-h-[680px] md:min-h-[760px]';
	const translator = useTranslator(lang || 'en', 'website-me');
	const baseColumns = makeColumns(hideProgramName, hideLocalPartner, translator);
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
				},
				...baseColumns,
			] as ColumnDef<Row>[])
		: baseColumns;
	const activeQuery = query ?? null;
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		showEntityIdColumn
			? ({
					id: false,
					firebaseAuthUserId: false,
				} as VisibilityState)
			: ({
					firebaseAuthUserId: false,
				} as VisibilityState),
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

	const resolvedToolbarFilters: ToolbarFilter[] =
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
	const toolbarSortOptions: ToolbarSortOption[] = sortOptions;
	const onSortToolbarChange = (sortBy?: string, sortDirection?: 'asc' | 'desc') => {
		if (!onQueryChange) {
			return;
		}
		onQueryChange({
			page: 1,
			sortBy: sortBy || undefined,
			sortDirection: sortBy ? (sortDirection ?? 'asc') : undefined,
		});
	};

	return (
		<div data-testid="data-table">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<h2 className="text-3xl">
						{title}{' '}
						<span className="text-lg text-gray-500">({activeQuery ? activeQuery.totalRows : displayedData.length})</span>
					</h2>
					{titleInfoTooltip ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="inline-flex items-center rounded-full p-1 text-gray-500 hover:text-gray-700"
									aria-label="Table information"
								>
									<InfoIcon className="size-4" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={8}>
								{titleInfoTooltip}
							</TooltipContent>
						</Tooltip>
					) : null}
				</div>
				<DataTableToolbar
					showControls={showControls}
					searchKeys={onQueryChange ? resolvedSearchKeys : []}
					searchValue={activeQuery?.search ?? ''}
					onSearchChange={onSearchChange}
					sortOptions={onQueryChange ? toolbarSortOptions : []}
					sortBy={activeQuery?.sortBy}
					sortDirection={activeQuery?.sortDirection}
					onSortChange={onSortToolbarChange}
					filters={resolvedToolbarFilters}
					columns={toolbarColumns}
					onClearFilters={clearAllToolbarFilters}
					actionMenuItems={actionMenuItems}
				/>
			</div>

			{error ? (
				<div className={cn('flex items-center', stableTableMinHeightClass)}>
					<div className="w-full rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
						<p className="font-medium">Could not load table data.</p>
						<p className="mt-1 text-sm">{formatTableError(error)}</p>
					</div>
				</div>
			) : isLoading ? (
				<AppLoadingSkeleton message="Loading..." />
			) : isDatasetEmpty ? (
				<div className={cn('flex items-start pt-2', stableTableMinHeightClass)}>
					<div className="w-full">
						<DataTableEmptyState emptyMessage={emptyMessage} />
					</div>
				</div>
			) : isEmpty ? (
				<div className={cn('flex items-start pt-2', stableTableMinHeightClass)}>
					<div
						className="w-full p-4 text-gray-500"
						dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}
					></div>
				</div>
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
