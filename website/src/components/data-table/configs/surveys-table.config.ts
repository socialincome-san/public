import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { SurveyTableViewRow } from '@/modules/surveys/survey.types';
import { linkedRecordFilter } from './linked-record-filter';

type SurveyFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: { id: string; name: string }[];
	recipientFilterOptions: { id: string; name: string }[];
	showProgramFilter: boolean;
};

export const surveysTableConfig: DataTableConfig<SurveyTableViewRow> = {
	id: 'surveys',
	title: 'Surveys',
	emptyMessage: 'No surveys found',
	searchKeys: ['id', 'name', 'recipientName', 'programName'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'recipientName', label: 'Recipient' },
		{ id: 'programName', label: 'Program' },
		{ id: 'questionnaire', label: 'Questionnaire' },
		{ id: 'language', label: 'Language' },
		{ id: 'status', label: 'Status' },
		{ id: 'dueAt', label: 'Due date' },
		{ id: 'completedAt', label: 'Completed' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: (hideProgramName) => makeSurveyColumns({ hideProgramName }),
	showColumnVisibilitySelector: true,
};

export const recipientSurveysTableConfig: DataTableConfig<SurveyTableViewRow> = {
	...surveysTableConfig,
	id: 'recipient-surveys',
	searchKeys: ['id', 'name'],
	sortOptions: surveysTableConfig.sortOptions?.filter(({ id }) => id !== 'recipientName' && id !== 'programName'),
	makeColumns: () => makeSurveyColumns({ hideRecipient: true, hideProgramName: true }),
};

export const getSurveysTableFilters = ({
	query,
	programFilterOptions,
	recipientFilterOptions,
	showProgramFilter,
}: SurveyFiltersArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	const programFilter: TableFilterConfig = {
		id: 'program',
		queryKey: 'programId',
		label: 'Program',
		placeholder: 'All programs',
		value: query.programId,
		options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
	};

	return [
		...(showProgramFilter ? [programFilter] : []),
		...linkedRecordFilter({
			id: 'recipient',
			queryKey: 'recipientId',
			label: 'Recipient',
			placeholder: 'All recipients',
			value: query.recipientId,
			options: recipientFilterOptions.map((recipient) => ({ value: recipient.id, label: recipient.name })),
		}),
	];
};
