'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { logger } from '@/utils/logger';
import { useState } from 'react';
import { PayoutForm } from './payout-form';

type PayoutFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payoutId?: string;
	readOnly?: boolean;
};

export function PayoutFormDialog({ open, onOpenChange, payoutId, readOnly = false }: PayoutFormDialogProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		setErrorMessage(`Error saving payout: ${error}`);
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
					<DialogTitle>{readOnly ? 'View payout' : payoutId ? 'Edit payout' : 'Add payout'}</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
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
}
