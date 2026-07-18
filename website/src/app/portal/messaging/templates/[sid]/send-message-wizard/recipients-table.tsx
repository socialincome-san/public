'use client';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Input } from '@/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { listMessagingRecipientsAction } from '@/lib/server-actions/messaging-actions';
import type {
	MessagingRecipientFilterOption,
	MessagingRecipientFilterOptions,
	MessagingRecipientFilters,
	MessagingRecipientsPage,
	MessagingRecipientType,
} from '@/lib/services/twilio/messaging/recipients/recipients.types';
import {
	clearSelection,
	getPageCheckboxState,
	getSelectedCount,
	isRowSelected,
	selectAllMatching,
	togglePage,
	toggleRow,
} from '@/lib/services/twilio/messaging/recipients/selection';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState, useTransition } from 'react';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

type SearchInputProps = {
	value: string;
	onDebouncedChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

const SearchInput = ({ value, onDebouncedChange, placeholder, className }: SearchInputProps) => {
	const [local, setLocal] = useState(value);
	const [prevValue, setPrevValue] = useState(value);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Sync the input to the controlled value when it changes externally (e.g. a reset),
	// adjusting state during render rather than in an effect. See react.dev "You Might Not Need an Effect".
	if (value !== prevValue) {
		setPrevValue(value);
		setLocal(value);
	}

	// When the controlled value changes externally (e.g. a reset), cancel any pending debounce so a
	// stale keystroke can't fire afterwards and undo the reset.
	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, [value]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleChange = (next: string) => {
		setLocal(next);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(() => onDebouncedChange(next), DEBOUNCE_MS);
	};

	return (
		<Input
			type="search"
			value={local}
			onChange={(e) => handleChange(e.target.value)}
			placeholder={placeholder ?? 'Search…'}
			className={className}
		/>
	);
};

type FilterDef = {
	id: string;
	label: string;
	placeholder: string;
	key: keyof MessagingRecipientFilters;
	value?: string;
	options: MessagingRecipientFilterOption[];
};

const buildFilterDefs = (
	type: MessagingRecipientType,
	filters: MessagingRecipientFilters,
	options: MessagingRecipientFilterOptions,
): FilterDef[] => {
	if (type === 'recipient') {
		return [
			{
				id: 'program',
				label: 'Program',
				placeholder: 'All programs',
				key: 'programId',
				value: filters.programId,
				options: options.program ?? [],
			},
			{
				id: 'status',
				label: 'Status',
				placeholder: 'All statuses',
				key: 'recipientStatus',
				value: filters.recipientStatus,
				options: options.status ?? [],
			},
		];
	}
	if (type === 'contributor') {
		return [
			{
				id: 'country',
				label: 'Country',
				placeholder: 'All countries',
				key: 'country',
				value: filters.country,
				options: options.country ?? [],
			},
		];
	}

	return [];
};

type FiltersToolbarProps = {
	filterDefs: FilterDef[];
	onFilterChange: (key: keyof MessagingRecipientFilters, value: string) => void;
	onClearFilters: () => void;
};

const FiltersToolbar = ({ filterDefs, onFilterChange, onClearFilters }: FiltersToolbarProps) => {
	const activeFilterCount = filterDefs.filter((filter) => Boolean(filter.value)).length;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button type="button" variant="outline" size="icon" className="relative size-10 shrink-0" aria-label="Filters">
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
					<Button type="button" variant="ghost" size="sm" onClick={onClearFilters} disabled={activeFilterCount === 0}>
						Clear
					</Button>
				</div>
				<div className="space-y-2">
					{filterDefs.map((filter) => {
						const hasOptions = filter.options.length > 0;

						return (
							<div key={filter.id} className="space-y-1">
								<label className="text-muted-foreground text-xs">{filter.label}</label>
								<Select
									key={`${filter.id}-${filter.value ?? 'none'}`}
									value={hasOptions ? filter.value : undefined}
									onValueChange={(value) => onFilterChange(filter.key, value)}
									disabled={!hasOptions}
								>
									<SelectTrigger className="h-9 w-full">
										<SelectValue placeholder={hasOptions ? filter.placeholder : 'No options available'} />
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
												No options available
											</SelectItem>
										)}
									</SelectContent>
								</Select>
							</div>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export type RecipientsTableQuery = {
	type: MessagingRecipientType;
	page: number;
	search: string;
	filters: MessagingRecipientFilters;
};

type RecipientsTableProps = {
	query: RecipientsTableQuery;
	search: string;
	onSearchChange: (value: string) => void;
	onPageChange: (page: number) => void;
	onFiltersChange: (filters: MessagingRecipientFilters) => void;
	onTotalCountChange?: (totalCount: number) => void;
	selection?: SelectionState;
	onSelectionChange?: (next: SelectionState) => void;
	notice?: string;
};

export const RecipientsTable = ({
	query,
	search,
	onSearchChange,
	onPageChange,
	onFiltersChange,
	onTotalCountChange,
	selection,
	onSelectionChange,
	notice,
}: RecipientsTableProps) => {
	const [data, setData] = useState<MessagingRecipientsPage | null>(null);
	const [filterOptions, setFilterOptions] = useState<MessagingRecipientFilterOptions>({});
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		// Concurrent search/filter/page requests can resolve out of order; ignore any response that
		// arrives after the query has already changed so an older result can't overwrite the current one.
		let active = true;
		startTransition(async () => {
			setError(null);
			const result = await listMessagingRecipientsAction(query.type, {
				page: query.page,
				pageSize: PAGE_SIZE,
				search: query.search,
				filters: query.filters,
			});
			if (!active) {
				return;
			}
			if (result.success) {
				setData(result.data);
				setFilterOptions(result.data.filterOptions);
				onTotalCountChange?.(result.data.totalCount);
			} else {
				setData(null);
				setError(result.error);
			}
		});

		return () => {
			active = false;
		};
	}, [query, onTotalCountChange]);

	const filterDefs = buildFilterDefs(query.type, query.filters, filterOptions);
	const filtersToolbar =
		filterDefs.length > 0 ? (
			<FiltersToolbar
				filterDefs={filterDefs}
				onFilterChange={(key, value) => onFiltersChange({ ...query.filters, [key]: value })}
				onClearFilters={() => onFiltersChange({})}
			/>
		) : null;

	// Fills the available height so the region stays the same size across loading/empty/error and data states.
	const messageBox = (node: ReactNode) => <div className="flex min-h-0 flex-1 items-center justify-center">{node}</div>;

	const renderTableRegion = () => {
		if (error) {
			return messageBox(<p className="text-destructive text-sm">{error}</p>);
		}

		if (!data && isPending) {
			return messageBox(<p className="text-muted-foreground text-sm">Loading…</p>);
		}

		if (!data || data.rows.length === 0) {
			return messageBox(<p className="text-muted-foreground text-sm">No entries.</p>);
		}

		const isSelectable = selection !== undefined && onSelectionChange !== undefined;
		const pageIds = data.rows.map((r) => r.id);
		const pageCheckboxState = isSelectable ? getPageCheckboxState(selection, pageIds) : 'none';

		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{isSelectable && (
								<TableHead className="h-9 w-10 py-1.5">
									<Checkbox
										aria-label="Select all rows on this page"
										checked={pageCheckboxState === 'all' ? true : pageCheckboxState === 'some' ? 'indeterminate' : false}
										onCheckedChange={() => onSelectionChange(togglePage(selection, pageIds))}
									/>
								</TableHead>
							)}
							<TableHead className="h-9 py-1.5">Name</TableHead>
							<TableHead className="h-9 py-1.5">Details</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.rows.map((row) => (
							<TableRow key={row.id}>
								{isSelectable && (
									<TableCell className="w-10 py-1.5">
										<Checkbox
											aria-label={`Select ${row.name}`}
											checked={isRowSelected(selection, row.id)}
											onCheckedChange={() => onSelectionChange(toggleRow(selection, row.id))}
										/>
									</TableCell>
								)}
								<TableCell className="py-1.5">{row.name}</TableCell>
								<TableCell className="text-muted-foreground py-1.5">{row.subtitle ?? '—'}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	const renderFooter = () => {
		if (!data) {
			return null;
		}

		const totalPages = Math.max(1, Math.ceil(data.totalCount / data.pageSize));
		const isSelectable = selection !== undefined && onSelectionChange !== undefined;
		const pageIds = data.rows.map((r) => r.id);
		const pageCheckboxState = isSelectable ? getPageCheckboxState(selection, pageIds) : 'none';
		const selectedCount = isSelectable ? getSelectedCount(selection, data.totalCount) : 0;
		const canOfferSelectAll =
			isSelectable && selection.mode === 'include' && pageCheckboxState === 'all' && data.totalCount > data.rows.length;

		let status: ReactNode;
		if (notice) {
			status = <span>{notice}</span>;
		} else if (isSelectable && selection.mode === 'all-matching') {
			status = (
				<>
					<span className="text-foreground">All {selectedCount} selected</span>
					<Button variant="link" size="sm" onClick={() => onSelectionChange(clearSelection())}>
						Clear
					</Button>
				</>
			);
		} else if (isSelectable && selectedCount > 0) {
			status = (
				<>
					<span className="text-foreground">{selectedCount} selected</span>
					{canOfferSelectAll && (
						<Button
							variant="link"
							size="sm"
							onClick={() => onSelectionChange(selectAllMatching(selection, query.search, query.filters))}
						>
							Select all {data.totalCount}
						</Button>
					)}
					<Button variant="link" size="sm" onClick={() => onSelectionChange(clearSelection())}>
						Clear
					</Button>
				</>
			);
		} else {
			status = <span>{data.totalCount} recipients</span>;
		}

		return (
			<div className="flex shrink-0 items-center justify-between gap-4 text-sm">
				<div className="text-muted-foreground flex min-w-0 items-center gap-2">{status}</div>
				<div className="flex shrink-0 items-center gap-2">
					<span className="text-muted-foreground">
						Page {data.page} of {totalPages}
					</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							aria-label="Previous page"
							disabled={data.page <= 1 || isPending}
							onClick={() => onPageChange(Math.max(1, query.page - 1))}
						>
							<ChevronLeftIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							aria-label="Next page"
							disabled={data.page >= totalPages || isPending}
							onClick={() => onPageChange(query.page + 1)}
						>
							<ChevronRightIcon className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			<div className="flex shrink-0 items-center gap-2">
				<SearchInput value={search} onDebouncedChange={onSearchChange} className="flex-1" />
				{filtersToolbar}
			</div>
			{renderTableRegion()}
			{renderFooter()}
		</div>
	);
};
