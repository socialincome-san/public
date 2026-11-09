'use client';

import { ArrowUpDownIcon, Columns3Icon, FilterIcon, SearchIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import { Input } from '../../forms/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../forms/select/select';
import { Switch } from '../../forms/switch/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlays/popover/popover';

type DataTableToolbarFilterOption = {
	value: string;
	label: string;
};

export type DataTableToolbarFilter = {
	id: string;
	label: string;
	placeholder: string;
	value?: string;
	options: DataTableToolbarFilterOption[];
	onChange: (value: string | undefined) => void;
};

export type DataTableToolbarColumn = {
	id: string;
	label: string;
	visible: boolean;
	onToggle: (visible: boolean) => void;
};

export type DataTableToolbarSortOption = {
	id: string;
	label: string;
};

export type DataTableSortDirection = 'asc' | 'desc';

export type DataTableToolbarLabels = {
	search: string;
	searchPlaceholder: string;
	searchFields: string;
	clear: string;
	columns: string;
	visibleColumns: string;
	sort: string;
	sortBy: string;
	field: string;
	chooseField: string;
	direction: string;
	chooseDirection: string;
	ascending: string;
	descending: string;
	filters: string;
	filterResults: string;
	noOptionsAvailable: string;
};

const isSortDirection = (value: string): value is DataTableSortDirection => value === 'asc' || value === 'desc';

type DataTableToolbarProps = {
	labels: DataTableToolbarLabels;
	showControls: boolean;
	searchKeys: string[];
	searchValue?: string;
	onSearchChange: (value: string) => void;
	actions?: ReactNode;
	filters?: DataTableToolbarFilter[];
	columns?: DataTableToolbarColumn[];
	sortOptions?: DataTableToolbarSortOption[];
	sortBy?: string;
	sortDirection?: DataTableSortDirection;
	onSortChange?: (sortBy?: string, sortDirection?: DataTableSortDirection) => void;
	onClearFilters?: () => void;
};

export const DataTableToolbar = ({
	labels,
	showControls,
	searchKeys,
	searchValue,
	onSearchChange,
	actions,
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
								aria-label={labels.search}
								data-testid="data-table-search-button"
							>
								<SearchIcon className="size-4" />
								{hasSearchValue ? (
									<span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" aria-hidden />
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">{labels.search}</p>
									<Button type="button" variant="ghost" size="sm" onClick={clearSearch} disabled={!hasSearchValue}>
										{labels.clear}
									</Button>
								</div>
								<Input
									key={`table-search-${searchValue ?? ''}`}
									placeholder={labels.searchPlaceholder}
									defaultValue={searchValue}
									onChange={(e) => onSearchChange(e.target.value)}
									autoFocus
									data-testid="data-table-search-input"
								/>
								<p className="text-muted-foreground text-xs">
									{labels.searchFields} {searchKeys.join(', ')}
								</p>
							</div>
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
								aria-label={labels.columns}
								data-testid="data-table-columns-button"
							>
								<Columns3Icon className="size-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">{labels.visibleColumns}</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={clearAllColumns}
										disabled={hiddenColumnCount === 0}
									>
										{labels.clear}
									</Button>
								</div>
								<div className="space-y-1">
									{columns.map((column) => (
										<label
											key={column.id}
											className="flex items-center justify-between gap-3 text-sm"
											data-testid={`data-table-column-${column.id}-label`}
										>
											<span>{column.label}</span>
											<Switch
												checked={column.visible}
												onCheckedChange={column.onToggle}
												data-testid={`data-table-column-${column.id}-toggle`}
											/>
										</label>
									))}
								</div>
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
								aria-label={labels.sort}
								data-testid="data-table-sort-button"
							>
								<ArrowUpDownIcon className="size-4" />
								{hasSortingValue ? (
									<span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" aria-hidden />
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">{labels.sortBy}</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => onSortChange?.(undefined, undefined)}
										disabled={!hasSortingValue}
									>
										{labels.clear}
									</Button>
								</div>
								<div className="space-y-2">
									<div className="space-y-1">
										<label className="text-muted-foreground text-xs">{labels.field}</label>
										<Select value={sortBy} onValueChange={(value) => onSortChange?.(value, sortDirection ?? 'asc')}>
											<SelectTrigger data-testid="data-table-sort-field-trigger">
												<SelectValue placeholder={labels.chooseField} />
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
										<label className="text-muted-foreground text-xs">{labels.direction}</label>
										<Select
											value={sortDirection}
											onValueChange={(value) => {
												if (isSortDirection(value)) {
													onSortChange?.(sortBy, value);
												}
											}}
											disabled={!sortBy}
										>
											<SelectTrigger data-testid="data-table-sort-direction-trigger">
												<SelectValue placeholder={labels.chooseDirection} />
											</SelectTrigger>
											<SelectContent align="end">
												<SelectItem value="asc">{labels.ascending}</SelectItem>
												<SelectItem value="desc">{labels.descending}</SelectItem>
											</SelectContent>
										</Select>
									</div>
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
								aria-label={labels.filters}
								data-testid="data-table-filters-button"
							>
								<FilterIcon className="size-4" />
								{activeFilterCount > 0 ? (
									<span className="bg-primary text-primary-foreground text-2xs absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 leading-none">
										{activeFilterCount}
									</span>
								) : null}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">{labels.filterResults}</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={clearAllFilters}
										disabled={activeFilterCount === 0}
									>
										{labels.clear}
									</Button>
								</div>
								<div className="space-y-2">
									{filters.map((filter) => {
										const hasOptions = filter.options.length > 0;

										return (
											<div key={filter.id} className="space-y-1">
												<label className="text-muted-foreground text-xs">{filter.label}</label>
												<Select
													key={`${filter.id}-${filter.value ?? 'none'}`}
													value={hasOptions ? filter.value : undefined}
													onValueChange={(value) => filter.onChange(value)}
													disabled={!hasOptions}
												>
													<SelectTrigger data-testid={`data-table-filter-${filter.id}-trigger`}>
														<SelectValue placeholder={hasOptions ? filter.placeholder : labels.noOptionsAvailable} />
													</SelectTrigger>
													<SelectContent align="end">
														{hasOptions ? (
															filter.options.map((option) => (
																<SelectItem key={option.value} value={option.value}>
																	{option.label}
																</SelectItem>
															))
														) : (
															<SelectItem value="no-options-available" disabled>
																{labels.noOptionsAvailable}
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											</div>
										);
									})}
								</div>
							</div>
						</PopoverContent>
					</Popover>
				) : null}
				{showControls ? actions : null}
			</div>
		</div>
	);
};
