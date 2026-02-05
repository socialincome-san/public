'use client';

import { Button } from '@/components/button';
import { makeSurveyColumns } from '@/components/data-table/columns/surveys';
import DataTable from '@/components/data-table/data-table';
import { ProgramPermission } from '@/generated/prisma/client';
import type { SurveyTableViewRow } from '@/lib/services/survey/survey.types';
import { useState } from 'react';
import { GenerateSurveysDialog } from './generate-surveys-dialog';
import { SurveyFormDialog } from './survey-form-dialog';

export function SurveysTableClient({ rows, error }: { rows: SurveyTableViewRow[]; error: string | null }) {
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
			<DataTable
				title="Surveys"
				error={error}
				emptyMessage="No surveys found"
				data={rows}
				makeColumns={makeSurveyColumns}
				onRowClick={openEditForm}
				actions={
					<div className="flex gap-2">
						<Button onClick={openEmptyForm}>Add survey</Button>
						<Button onClick={() => setIsGenerationDialogOpen(true)}>Generate surveys</Button>
					</div>
				}
				searchKeys={['name', 'recipientName', 'programName']}
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
}
