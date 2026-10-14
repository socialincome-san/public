'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useState } from 'react';
import { SurveyForm } from './survey-form';

type SurveyFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	surveyId?: string;
};

export const SurveyFormDialog = ({ open, onOpenChange, surveyId }: SurveyFormDialogProps) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving survey: ${message}`);
		console.error('Survey Form Error', { error });
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setErrorMessage(null);
		}
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			<SurveyForm
				surveyId={surveyId}
				onSuccess={() => {
					onOpenChange(false);
				}}
				onError={onError}
				onCancel={() => onOpenChange(false)}
			/>
		</>
	);

	if (surveyId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={handleOpenChange}
				title="Edit Survey"
				tabs={[{ value: 'details', label: 'Details', content: form }, auditLogTab('survey', surveyId)]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Add Survey</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
