'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import type { SurveyTableViewRow } from '@socialincome/shared/src/database/services/survey/survey.types';
import { useState } from 'react';
import { SurveyForm } from './survey-form';

type SurveyFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	surveyId?: string;
	readOnly?: boolean;
};

export function SurveyFormDialog({ open, onOpenChange, surveyId, readOnly = false }: SurveyFormDialogProps) {
	const [hasError, setHasError] = useState(false);

	const onError = (e?: unknown) => {
		setHasError(true);
		console.error('Survey Form Error:', e);
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setHasError(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
						onOpenChange(false);
						window.location.reload();
					}}
					onError={onError}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}