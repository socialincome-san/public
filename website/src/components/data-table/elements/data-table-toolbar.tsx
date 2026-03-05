'use client';

import { Button } from '@/components/button';
import { ActionMenu, type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Switch } from '@/components/switch';
import { ArrowUpDownIcon, Columns3Icon, FilterIcon, SearchIcon } from 'lucide-react';
import { Input } from '../../input';

export type ToolbarFilterOption = {
	value: string;
	label: string;
};

export type ToolbarFilter = {
	id: string;
	label: string;
	placeholder: string;
	value?: string;
	options: ToolbarFilterOption[];
	onChange: (value: string | undefined) => void;
};

type ToolbarColumn = {
	id: string;
	label: string;
	visible: boolean;
	onToggle: (visible: boolean) => void;
};

export type ToolbarSortOption = {
	id: string;
	label: string;
};

type DataTableToolbarProps = {
	showControls: boolean;
	searchKeys: string[];
	searchValue?: string;
	onSearchChange: (value: string) => void;
	actionMenuItems?: ActionMenuItem[];
	filters?: ToolbarFilter[];
	columns?: ToolbarColumn[];
	sortOptions?: ToolbarSortOption[];
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	onSortChange?: (sortBy?: string, sortDirection?: 'asc' | 'desc') => void;
	onClearFilters?: () => void;
};

export const DataTableToolbar = ({
	showControls,
	searchKeys,
	searchValue,
	onSearchChange,
	actionMenuItems,
	filters = [],
	columns = [],
	sortOptions = [],
	sortBy,
	sortDirection,
	onSortChange,
	onClearFilters,
}: DataTableToolbarProps) => {
	const hasFilters = showControls && filters.length > 0;
	const hasColumns = showControls && columns.length > 0;
	const hasSearch = showControls && searchKeys.length > 0;
	const hasSorting = showControls && sortOptions.length > 0 && Boolean(onSortChange);
	const hasSearchValue = Boolean(searchValue?.trim());
	const hasSortingValue = Boolean(sortBy && sortDirection);
	const activeFilterCount = filters.filter((filter) => Boolean(filter.value)).length;
	const hiddenColumnCount = columns.filter((column) => !column.visible).length;
	const clearAllColumns = () => {
		columns.forEach((column) => column.onToggle(true));
	};
	const clearSearch = () => onSearchChange('');
	const clearAllFilters = () => {
		if (onClearFilters) {
			onClearFilters();
			return;
		}
		filters.forEach((filter) => filter.onChange(undefined));
	};

	return (
		<div className="flex flex-wrap items-center justify-end gap-2" data-testid="data-table-toolbar">
			<div className="flex items-center gap-2">
				{hasSearch ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="relative"
								aria-label="Search"
								data-testid="data-table-search-button"
							>
								<SearchIcon className="size-4" />
								{hasSearchValue ? (
									<span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" aria-hidden />
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[320px] space-y-2 p-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Search</p>
								<Button type="button" variant="ghost" size="sm" onClick={clearSearch} disabled={!hasSearchValue}>
									Clear
								</Button>
							</div>
							<Input
								key={`table-search-${searchValue ?? ''}`}
								placeholder="Search..."
								defaultValue={searchValue}
								onChange={(e) => onSearchChange(e.target.value)}
								autoFocus
								data-testid="data-table-search-input"
							/>
							<p className="text-muted-foreground text-xs">Fields: {searchKeys.join(', ')}</p>
						</PopoverContent>
					</Popover>
				) : null}
				{hasColumns ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Columns"
								data-testid="data-table-columns-button"
							>
								<Columns3Icon className="size-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[260px] space-y-3 p-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Visible columns</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={clearAllColumns}
									disabled={hiddenColumnCount === 0}
								>
									Clear
								</Button>
							</div>
							<div className="space-y-1">
								{columns.map((column) => (
									<label key={column.id} className="flex items-center justify-between gap-3 text-sm">
										<span>{column.label}</span>
										<Switch checked={column.visible} onCheckedChange={column.onToggle} />
									</label>
								))}
							</div>
						</PopoverContent>
					</Popover>
				) : null}
				{hasSorting ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="relative"
								aria-label="Sort"
								data-testid="data-table-sort-button"
							>
								<ArrowUpDownIcon className="size-4" />
								{hasSortingValue ? (
									<span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" aria-hidden />
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[280px] space-y-3 p-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Sort by</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => onSortChange?.(undefined, undefined)}
									disabled={!hasSortingValue}
								>
									Clear
								</Button>
							</div>
							<div className="space-y-2">
								<div className="space-y-1">
									<label className="text-muted-foreground text-xs">Field</label>
									<Select value={sortBy} onValueChange={(value) => onSortChange?.(value, sortDirection ?? 'asc')}>
										<SelectTrigger className="h-9 w-full">
											<SelectValue placeholder="Choose field" />
										</SelectTrigger>
										<SelectContent align="end">
											{sortOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1">
									<label className="text-muted-foreground text-xs">Direction</label>
									<Select
										value={sortDirection}
										onValueChange={(value) => onSortChange?.(sortBy, value as 'asc' | 'desc')}
										disabled={!sortBy}
									>
										<SelectTrigger className="h-9 w-full">
											<SelectValue placeholder="Choose direction" />
										</SelectTrigger>
										<SelectContent align="end">
											<SelectItem value="asc">Ascending</SelectItem>
											<SelectItem value="desc">Descending</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				) : null}
				{hasFilters ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="relative"
								aria-label="Filters"
								data-testid="data-table-filters-button"
							>
								<FilterIcon className="size-4" />
								{activeFilterCount > 0 ? (
									<span className="bg-primary text-primary-foreground absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none">
										{activeFilterCount}
									</span>
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[280px] space-y-3 p-3">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Filter results</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={clearAllFilters}
									disabled={activeFilterCount === 0}
								>
									Clear
								</Button>
							</div>
							<div className="space-y-2">
								{filters.map((filter) => (
									<div key={filter.id} className="space-y-1">
										<label className="text-muted-foreground text-xs">{filter.label}</label>
										<Select
											key={`${filter.id}-${filter.value ?? 'none'}`}
											value={filter.value}
											onValueChange={(value) => filter.onChange(value)}
										>
											<SelectTrigger className="h-9 w-full">
												<SelectValue placeholder={filter.placeholder} />
											</SelectTrigger>
											<SelectContent align="end">
												{filter.options.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>
				) : null}
				{showControls ? <ActionMenu items={actionMenuItems} /> : null}
			</div>
		</div>
	);
};
