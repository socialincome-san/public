'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SurveyForm } from './survey-form';

type SurveyFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	surveyId?: string;
};

export const SurveyFormDialog = ({ open, onOpenChange, surveyId }: SurveyFormDialogProps) => {
	const t = useTranslations('portal-management');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(t('dialogs.saveSurveyError', { message }));
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
			title={surveyId ? t('dialogs.editSurvey') : t('dialogs.addSurvey')}
			tabs={surveyId ? [{ ...auditLogTab('survey', surveyId), label: t('dialogs.auditLog') }] : []}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('dialogs.error')}</AlertTitle>
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
