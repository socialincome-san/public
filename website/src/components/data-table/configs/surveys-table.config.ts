import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';

type SurveyFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: { id: string; name: string }[];
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
	makeColumns: makeSurveyColumns,
	showColumnVisibilitySelector: true,
};

export const getSurveysTableFilters = ({
	query,
	programFilterOptions,
	showProgramFilter,
}: SurveyFiltersArgs): TableFilterConfig[] => {
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
