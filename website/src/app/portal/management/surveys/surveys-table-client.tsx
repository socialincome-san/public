'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getSurveysTableFilters, surveysTableConfig } from '@/components/data-table/configs/surveys-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import type { SurveyTableViewRow } from '@/modules/surveys/survey.types';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { GenerateSurveysDialog } from './generate-surveys-dialog';
import { SurveyFormDialog } from './survey-form-dialog';

type Props = {
	rows: SurveyTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions?: { id: string; name: string }[];
	recipientFilterOptions?: { id: string; name: string }[];
	showProgramFilter?: boolean;
	hideProgramName?: boolean;
};

export const SurveysTableClient = ({
	rows,
	error,
	query,
	programFilterOptions = [],
	recipientFilterOptions = [],
	showProgramFilter = true,
	hideProgramName = false,
}: Props) => {
	const { recordId: surveyId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('surveyId');
	const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

	return (
		<>
			<ConfiguredDataTableClient
				config={surveysTableConfig}
				titleInfoTooltip="Shows surveys for programs you can access."
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={getSurveysTableFilters({ query, programFilterOptions, recipientFilterOptions, showProgramFilter })}
				hideProgramName={hideProgramName}
				onRowClick={(row) => openRecord(row.id)}
				actionMenuItems={[
					{
						label: 'Add survey',
						icon: <PlusIcon />,
						onSelect: openCreate,
					},
					{
						label: 'Generate surveys',
						icon: <ClipboardListIcon />,
						onSelect: () => setIsGenerationDialogOpen(true),
					},
				]}
			/>

			<SurveyFormDialog open={open} onOpenChange={onOpenChange} surveyId={surveyId} />

			<GenerateSurveysDialog open={isGenerationDialogOpen} setOpen={setIsGenerationDialogOpen} />
		</>
	);
};
