import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import { TableQueryState } from '@/components/data-table/query-state';
import { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';

type RecipientsFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: RecipientProgramFilterOption[];
	showProgramFilter: boolean;
};

export const recipientsTableConfig: DataTableConfig<RecipientTableViewRow> = {
	id: 'recipients',
	title: 'Recipients',
	emptyMessage: 'No recipients found',
	searchKeys: ['id', 'firstName', 'lastName', 'paymentCode', 'firebaseAuthUserId', 'localPartnerName', 'programName'],
	sortOptions: [
		{ id: 'recipient', label: 'Recipient' },
		{ id: 'country', label: 'Country' },
		{ id: 'paymentCode', label: 'Payment code' },
		{ id: 'dateOfBirth', label: 'Age' },
		{ id: 'localPartnerName', label: 'Local partner' },
		{ id: 'programName', label: 'Program' },
		{ id: 'startDate', label: 'Start date' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeRecipientColumns,
	showColumnVisibilitySelector: true,
};

export const getRecipientsTableFilters = ({
	query,
	programFilterOptions,
	showProgramFilter,
}: RecipientsFilterArgs): TableFilterConfig[] => {
	if (!query || !showProgramFilter) {
		return [];
	}

	return [
		{
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: query.programId,
			options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
		},
	];
};
