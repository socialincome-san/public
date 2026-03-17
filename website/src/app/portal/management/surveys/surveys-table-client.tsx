'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getSurveysTableFilters, surveysTableConfig } from '@/components/data-table/configs/surveys-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { GenerateSurveysDialog } from './generate-surveys-dialog';
import { SurveyFormDialog } from './survey-form-dialog';

type Props = {
	rows: SurveyTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions?: { id: string; name: string }[];
	showProgramFilter?: boolean;
	hideProgramName?: boolean;
};

export const SurveysTableClient = ({
	rows,
	error,
	query,
	programFilterOptions = [],
	showProgramFilter = true,
	hideProgramName = false,
}: Props) => {
	const [isSurveyFormOpen, setIsSurveyFormOpen] = useState(false);
	const [surveyId, setSurveyId] = useState<string | undefined>(undefined);
	const [readOnly, setReadOnly] = useState(false);
	const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

	const openEmptyForm = () => {
		setSurveyId(undefined);
		setReadOnly(false);
		setIsSurveyFormOpen(true);
	};

	const openEditForm = (row: SurveyTableViewRow) => {
		setSurveyId(row.id);
		setReadOnly(row.permission === ProgramPermission.owner);
		setIsSurveyFormOpen(true);
	};

	const handleSurveyFormClose = (open: boolean) => {
		setIsSurveyFormOpen(open);
		if (!open) {
			setSurveyId(undefined);
			setReadOnly(false);
		}
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={surveysTableConfig}
				titleInfoTooltip="Shows surveys for programs you can access."
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={getSurveysTableFilters({ query, programFilterOptions, showProgramFilter })}
				hideProgramName={hideProgramName}
				onRowClick={openEditForm}
				actionMenuItems={[
					{
						label: 'Add survey',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
					{
						label: 'Generate surveys',
						icon: <ClipboardListIcon />,
						onSelect: () => setIsGenerationDialogOpen(true),
					},
				]}
			/>

			<SurveyFormDialog
				open={isSurveyFormOpen}
				onOpenChange={handleSurveyFormClose}
				surveyId={surveyId}
				readOnly={readOnly}
			/>

			<GenerateSurveysDialog open={isGenerationDialogOpen} setOpen={setIsGenerationDialogOpen} />
		</>
	);
};
