'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Button } from '@/app/portal/components/button';
import { makeSurveyColumns } from '@/app/portal/components/data-table/columns/surveys';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';
import { useState } from 'react';
import { SurveyForm } from './survey-form';

export function SurveysTableClient({ rows, error }: { rows: SurveyTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [surveyId, setSurveyId] = useState<string | undefined>(undefined);
	const [readOnly, setReadOnly] = useState(false);

	const openEmptyForm = () => {
		setSurveyId(undefined);
		setReadOnly(false);
		setHasError(false);
		setOpen(true);
	};

	const openEditForm = (row: SurveyTableViewRow) => {
		setSurveyId(row.id);
		setReadOnly(row.permission === 'readonly');
		setHasError(false);
		setOpen(true);
	};

	const onError = (e?: unknown) => {
		setHasError(true);
		console.error('Survey Form Error:', e);
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
					</div>
				}
			/>

			<Dialog
				open={open}
				onOpenChange={(newOpen) => {
					setOpen(newOpen);
					if (!newOpen) {
						setSurveyId(undefined);
						setReadOnly(false);
						setHasError(false);
					}
				}}
			>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{surveyId ? 'Edit Survey' : 'Add Survey'}</DialogTitle>
					</DialogHeader>
					{hasError && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Something went wrong. Please try again.</AlertDescription>
						</Alert>
					)}
					<SurveyForm
						surveyId={surveyId}
						readOnly={readOnly}
						onSuccess={() => {
							setOpen(false);
							window.location.reload();
						}}
						onError={onError}
						onCancel={() => setOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
