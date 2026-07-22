'use client';

import type { MessagingRecipientFilters } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import { emptySelection } from '@/lib/services/twilio/messaging/recipients/selection';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import { RecipientsTable, type RecipientsTableQuery } from './recipients-table';
import type { ResetReason } from './types';

type Step2RecipientsProps = {
	query: RecipientsTableQuery;
	selection: SelectionState;
	lastResetReason: ResetReason;
	onQueryChange: (next: RecipientsTableQuery) => void;
	onSelectionChange: (next: SelectionState) => void;
	onLastResetReasonChange: (next: ResetReason) => void;
	onTotalCountChange: (next: number) => void;
};

export const Step2Recipients = ({
	query,
	selection,
	lastResetReason,
	onQueryChange,
	onSelectionChange,
	onLastResetReasonChange,
	onTotalCountChange,
}: Step2RecipientsProps) => {
	const handleSearchChange = (search: string) => {
		onQueryChange({ ...query, page: 1, search });
		if (selection.mode === 'all-matching') {
			onSelectionChange(emptySelection());
			onLastResetReasonChange('search-change');
		}
	};

	const handleFiltersChange = (filters: MessagingRecipientFilters) => {
		onQueryChange({ ...query, page: 1, filters });
		if (selection.mode === 'all-matching') {
			onSelectionChange(emptySelection());
			onLastResetReasonChange('filter-change');
		}
	};

	const handleSelectionChange = (next: SelectionState) => {
		onSelectionChange(next);
		onLastResetReasonChange(null);
	};

	const notice =
		lastResetReason === 'search-change'
			? 'Selection cleared because the search changed.'
			: lastResetReason === 'filter-change'
				? 'Selection cleared because the filters changed.'
				: undefined;

	return (
		<RecipientsTable
			query={query}
			search={query.search}
			onSearchChange={handleSearchChange}
			onPageChange={(page) => {
				onQueryChange({ ...query, page });
				onLastResetReasonChange(null);
			}}
			onFiltersChange={handleFiltersChange}
			onTotalCountChange={onTotalCountChange}
			selection={selection}
			onSelectionChange={handleSelectionChange}
			notice={notice}
		/>
	);
};
