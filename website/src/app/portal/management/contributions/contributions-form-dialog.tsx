'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { useState } from 'react';
import { ContributionForm } from './contribution-form';

export const ContributionFormDialog = ({
	open,
	onOpenChange,
	contributionId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contributionId?: string;
}) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving contribution: ${message}`);
		console.error('Contribution Form Error', { error });
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
			title={contributionId ? 'Edit Contribution' : 'Add Contribution'}
			tabs={contributionId ? [auditLogTab('contribution', contributionId)] : []}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<ContributionForm
				contributionId={contributionId}
				onSuccess={() => handleOpenChange(false)}
				onCancel={() => handleOpenChange(false)}
				onError={onError}
			/>
		</RecordDialog>
	);
};
