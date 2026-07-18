'use client';

import type { SelectionState } from '@/lib/services/twilio/messaging/recipients.types';
import { clearSelection, emptySelection, getSelectedCount } from '@/lib/services/twilio/messaging/selection';
import { RecipientsTable, type RecipientsTableQuery } from '../recipients-table';
import { SearchInput } from '../search-input';
import { SelectionFooter } from '../selection-footer';
import type { ResetReason } from './wizard.types';

type Props = {
	query: RecipientsTableQuery;
	selection: SelectionState;
	lastResetReason: ResetReason;
	totalCount: number;
	onQueryChange: (next: RecipientsTableQuery) => void;
	onSelectionChange: (next: SelectionState) => void;
	onLastResetReasonChange: (next: ResetReason) => void;
	onTotalCountChange: (next: number) => void;
};

export const Step2Recipients = ({
	query,
	selection,
	lastResetReason,
	totalCount,
	onQueryChange,
	onSelectionChange,
	onLastResetReasonChange,
	onTotalCountChange,
}: Props) => {
	const handleSearchChange = (search: string) => {
		onQueryChange({ ...query, page: 1, search });
		if (selection.mode === 'all-matching') {
			onSelectionChange(emptySelection());
			onLastResetReasonChange('search-change');
		}
	};

	const handleSelectionChange = (next: SelectionState) => {
		onSelectionChange(next);
		onLastResetReasonChange(null);
	};

	const selectedCount = getSelectedCount(selection, totalCount);

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-medium">Select recipients</h3>
			<SearchInput value={query.search} onDebouncedChange={handleSearchChange} />
			<RecipientsTable
				query={query}
				onPageChange={(page) => {
					onQueryChange({ ...query, page });
					onLastResetReasonChange(null);
				}}
				onTotalCountChange={onTotalCountChange}
				selection={selection}
				onSelectionChange={handleSelectionChange}
			/>
			<SelectionFooter
				notice={lastResetReason === 'search-change' ? 'Selection cleared because the search changed.' : undefined}
				selectedCount={selectedCount}
				onClear={() => {
					onSelectionChange(clearSelection(selection));
					onLastResetReasonChange(null);
				}}
			/>
		</section>
	);
};
