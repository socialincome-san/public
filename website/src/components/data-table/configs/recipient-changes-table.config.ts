import { makeRecipientChangeColumns } from '@/components/data-table/columns/recipient-changes';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { RecipientChangeTableViewRow } from '@/modules/recipients/recipient.types';
import type { DataTableConfig, TableFilterConfig } from '../table-config.types';
import { linkedRecordFilter } from './linked-record-filter';

export const recipientChangesTableConfig: DataTableConfig<RecipientChangeTableViewRow> = {
	id: 'recipient-changes',
	title: 'Recipient changes',
	emptyMessage: 'No recipient changes found',
	searchKeys: ['recipientId', 'recipientName'],
	makeColumns: makeRecipientChangeColumns,
};

type FilterOption = { value: string; label: string };

export const getRecipientChangesTableFilters = ({
	query,
	programs,
	recipients,
}: {
	query?: TableQueryState;
	programs: FilterOption[];
	recipients: FilterOption[];
}): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: query.programId,
			options: programs,
		},
		...linkedRecordFilter({
			id: 'recipient',
			queryKey: 'recipientId',
			label: 'Recipient',
			placeholder: 'All recipients',
			value: query.recipientId,
			options: recipients,
		}),
	];
};
