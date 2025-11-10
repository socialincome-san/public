'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { useState } from 'react';
import { PayoutForm } from './payout-form';

type PayoutFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payoutId?: string;
	readOnly?: boolean;
};

export function PayoutFormDialog({ open, onOpenChange, payoutId, readOnly = false }: PayoutFormDialogProps) {
	const [hasError, setHasError] = useState(false);

	const onError = (e?: unknown) => {
		setHasError(true);
		console.error('Payout Form Error:', e);
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setHasError(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{readOnly ? 'View payout' : payoutId ? 'Edit payout' : 'Add payout'}</DialogTitle>
				</DialogHeader>

				{hasError && (
					<Alert variant="destructive" className="mb-3">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>Error saving payout</AlertDescription>
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
