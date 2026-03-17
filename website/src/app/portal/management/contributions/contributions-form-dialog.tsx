'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { ContributionForm } from './contribution-form';

export const ContributionFormDialog = ({
	open,
	onOpenChange,
	contributionId,
	readOnly,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contributionId?: string;
	readOnly: boolean;
}) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	let dialogTitle = 'Add Contribution';
	if (contributionId) {
		dialogTitle = readOnly ? 'View Contribution' : 'Edit Contribution';
	}

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving contribution: ${message}`);
		logger.error('Contribution Form Error', { error });
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setErrorMessage(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
					</Alert>
				)}

				<ContributionForm
					contributionId={contributionId}
					onSuccess={() => handleOpenChange(false)}
					onCancel={() => handleOpenChange(false)}
					onError={onError}
					readOnly={readOnly}
				/>
			</DialogContent>
		</Dialog>
	);
};
