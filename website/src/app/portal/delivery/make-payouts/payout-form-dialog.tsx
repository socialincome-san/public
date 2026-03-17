'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { PayoutForm } from './payout-form';

type PayoutFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payoutId?: string;
	readOnly?: boolean;
};

export const PayoutFormDialog = ({ open, onOpenChange, payoutId, readOnly = false }: PayoutFormDialogProps) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	let dialogTitle = 'Add payout';
	if (readOnly) {
		dialogTitle = 'View payout';
	} else if (payoutId) {
		dialogTitle = 'Edit payout';
	}

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving payout: ${message}`);
		logger.error('Payout Form Error', { error });
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setErrorMessage(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
					</Alert>
				)}

				<PayoutForm
					payoutId={payoutId}
					readOnly={readOnly}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={onError}
				/>
			</DialogContent>
		</Dialog>
	);
};
