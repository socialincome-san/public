'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useState } from 'react';
import { PayoutForm } from './payout-form';

type PayoutFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payoutId?: string;
};

export const PayoutFormDialog = ({ open, onOpenChange, payoutId }: PayoutFormDialogProps) => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving payout: ${message}`);
		console.error('Payout Form Error', { error });
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

			<PayoutForm
				payoutId={payoutId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={onError}
			/>
		</>
	);

	if (payoutId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={handleOpenChange}
				title="Edit payout"
				tabs={[{ value: 'details', label: 'Details', content: form }, auditLogTab('payout', payoutId)]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Add payout</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
