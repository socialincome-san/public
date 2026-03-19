import { makeUpcomingOnboardingColumns } from '@/components/data-table/columns/upcoming-onboarding';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { RecipientProgramFilterOption, UpcomingOnboardingTableViewRow } from '@/lib/services/recipient/recipient.types';

type UpcomingOnboardingFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: RecipientProgramFilterOption[];
};

export const upcomingOnboardingTableConfig: DataTableConfig<UpcomingOnboardingTableViewRow> = {
	id: 'upcoming-onboarding',
	title: 'Upcoming Onboarding',
	emptyMessage: 'No upcoming onboarding recipients found',
	searchKeys: ['id', 'recipientName', 'programName', 'localPartnerName', 'communicationPhoneNumber'],
	sortOptions: [
		{ id: 'recipientName', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
		{ id: 'localPartnerName', label: 'Local partner' },
		{ id: 'communicationPhoneNumber', label: 'Communication phone' },
		{ id: 'daysUntilStart', label: 'Starts in' },
		{ id: 'startDate', label: 'Start date' },
		{ id: 'createdAt', label: 'Created' },
	],
	initialSorting: [{ id: 'daysUntilStart', desc: false }],
	makeColumns: makeUpcomingOnboardingColumns,
	showColumnVisibilitySelector: true,
};

export const getUpcomingOnboardingTableFilters = ({
	query,
	programFilterOptions,
}: UpcomingOnboardingFilterArgs): TableFilterConfig[] => {
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
			options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
		},
	];
};
