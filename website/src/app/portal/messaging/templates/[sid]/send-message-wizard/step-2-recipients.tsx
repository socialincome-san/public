'use client';

import type { MessagingRecipientFilters, SelectionState } from '@/modules/messaging/messaging.types';
import { useTranslations } from 'next-intl';
import { RecipientsTable, type RecipientsTableQuery } from './recipients-table';
import { emptySelection } from './selection';
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
	const t = useTranslations('portal-messaging');
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
			? t('wizard.recipients.searchChanged')
			: lastResetReason === 'filter-change'
				? t('wizard.recipients.filtersChanged')
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
