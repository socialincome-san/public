'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
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

	return (
		<RecordDialog
			open={open}
			onOpenChange={handleOpenChange}
			title={surveyId ? 'Edit Survey' : 'Add Survey'}
			tabs={surveyId ? [auditLogTab('survey', surveyId)] : []}
		>
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
		</RecordDialog>
	);
};
