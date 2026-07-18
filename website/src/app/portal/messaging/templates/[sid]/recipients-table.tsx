'use client';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { listMessagingRecipientsAction } from '@/lib/server-actions/messaging-actions';
import type {
	MessagingRecipientType,
	MessagingRecipientsPage,
	SelectionState,
} from '@/lib/services/twilio/messaging/recipients.types';
import {
	clearSelection,
	getPageCheckboxState,
	isRowSelected,
	selectAllMatching,
	togglePage,
	toggleRow,
} from '@/lib/services/twilio/messaging/selection';
import { useEffect, useState, useTransition } from 'react';
import { SelectAllMatchingBanner } from './select-all-matching-banner';

const PAGE_SIZE = 10;

export type RecipientsTableQuery = {
	type: MessagingRecipientType;
	page: number;
	search: string;
};

type Props = {
	query: RecipientsTableQuery;
	onPageChange: (page: number) => void;
	onTotalCountChange?: (totalCount: number) => void;
	selection?: SelectionState;
	onSelectionChange?: (next: SelectionState) => void;
};

export const RecipientsTable = ({ query, onPageChange, onTotalCountChange, selection, onSelectionChange }: Props) => {
	const [data, setData] = useState<MessagingRecipientsPage | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			setError(null);
			const result = await listMessagingRecipientsAction(query.type, {
				page: query.page,
				pageSize: PAGE_SIZE,
				search: query.search,
			});
			if (result.success) {
				setData(result.data);
				onTotalCountChange?.(result.data.totalCount);
			} else {
				setData(null);
				setError(result.error);
			}
		});
	}, [query, onTotalCountChange]);

	if (error) {
		return <p className="text-destructive text-sm">{error}</p>;
	}

	if (!data && isPending) {
		return <p className="text-muted-foreground text-sm">Loading…</p>;
	}

	if (!data || data.rows.length === 0) {
		return <p className="text-muted-foreground text-sm">No entries.</p>;
	}

	const totalPages = Math.max(1, Math.ceil(data.totalCount / data.pageSize));
	const isSelectable = selection !== undefined && onSelectionChange !== undefined;
	const pageIds = data.rows.map((r) => r.id);
	const pageCheckboxState = isSelectable ? getPageCheckboxState(selection, pageIds) : 'none';

	return (
		<div className="space-y-3">
			<Table>
				<TableHeader>
					<TableRow>
						{isSelectable && (
							<TableHead className="w-10">
								<Checkbox
									aria-label="Select all rows on this page"
									checked={pageCheckboxState === 'all' ? true : pageCheckboxState === 'some' ? 'indeterminate' : false}
									onCheckedChange={() => onSelectionChange(togglePage(selection, pageIds))}
								/>
							</TableHead>
						)}
						<TableHead>Name</TableHead>
						<TableHead>Details</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.rows.map((row) => (
						<TableRow key={row.id}>
							{isSelectable && (
								<TableCell className="w-10">
									<Checkbox
										aria-label={`Select ${row.name}`}
										checked={isRowSelected(selection, row.id)}
										onCheckedChange={() => onSelectionChange(toggleRow(selection, row.id))}
									/>
								</TableCell>
							)}
							<TableCell>{row.name}</TableCell>
							<TableCell className="text-muted-foreground">{row.subtitle ?? '—'}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{isSelectable && selection.mode === 'all-matching' && (
				<SelectAllMatchingBanner
					variant="active"
					totalCount={data.totalCount}
					pageRowCount={data.rows.length}
					onClear={() => onSelectionChange(clearSelection(selection))}
				/>
			)}
			{isSelectable && selection.mode === 'include' && pageCheckboxState === 'all' && data.totalCount > data.rows.length && (
				<SelectAllMatchingBanner
					variant="offer"
					totalCount={data.totalCount}
					pageRowCount={data.rows.length}
					onSelectAllMatching={() => onSelectionChange(selectAllMatching(selection, query.search))}
					onClear={() => onSelectionChange(clearSelection(selection))}
				/>
			)}

			<div className="flex items-center justify-between text-sm">
				<span className="text-muted-foreground">
					Page {data.page} of {totalPages} · {data.totalCount} total
				</span>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={data.page <= 1 || isPending}
						onClick={() => onPageChange(Math.max(1, query.page - 1))}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={data.page >= totalPages || isPending}
						onClick={() => onPageChange(query.page + 1)}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
