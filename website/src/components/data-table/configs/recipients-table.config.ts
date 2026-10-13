import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import { TableQueryState } from '@/components/data-table/query-state';
import { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { linkedRecordFilter } from './linked-record-filter';

type RecipientsFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: RecipientProgramFilterOption[];
	localPartnerFilterOptions: { id: string; name: string }[];
	showProgramFilter: boolean;
};

const recipientStatusOptions = [
	{ value: 'future', label: 'Future' },
	{ value: 'active', label: 'Active' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'completed', label: 'Completed' },
];

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
		{ id: 'status', label: 'Status' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeRecipientColumns,
	showColumnVisibilitySelector: true,
};

export const localPartnerRecipientsTableConfig: DataTableConfig<RecipientTableViewRow> = {
	...recipientsTableConfig,
	id: 'local-partner-recipients',
	searchKeys: ['id', 'firstName', 'lastName', 'paymentCode', 'programName'],
	sortOptions: recipientsTableConfig.sortOptions?.filter(({ id }) => id !== 'localPartnerName'),
	makeColumns: () => makeRecipientColumns(false, true),
};

export const getRecipientsTableFilters = ({
	query,
	programFilterOptions,
	localPartnerFilterOptions,
	showProgramFilter,
}: RecipientsFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	const filters: TableFilterConfig[] = [
		{
			id: 'recipientStatus',
			queryKey: 'recipientStatus',
			label: 'Status',
			placeholder: 'All statuses',
			value: query.recipientStatus,
			options: recipientStatusOptions,
		},
	];

	if (showProgramFilter) {
		filters.push({
			id: 'program',
			queryKey: 'programId',
			label: 'Program',
			placeholder: 'All programs',
			value: query.programId,
			options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
		});
	}

	return [
		...filters,
		...linkedRecordFilter({
			id: 'localPartner',
			queryKey: 'localPartnerId',
			label: 'Local partner',
			placeholder: 'All local partners',
			value: query.localPartnerId,
			options: localPartnerFilterOptions.map((localPartner) => ({ value: localPartner.id, label: localPartner.name })),
		}),
	];
};
