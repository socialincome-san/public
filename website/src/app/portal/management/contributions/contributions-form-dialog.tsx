'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
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

	const form = (
		<>
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
		</>
	);

	if (contributionId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={handleOpenChange}
				title="Edit Contribution"
				tabs={[{ value: 'details', label: 'Details', content: form }, auditLogTab('contribution', contributionId)]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Contribution</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
