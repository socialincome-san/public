'use client';

import { RecipientForm } from '@/components/recipient/recipient-form';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { Session } from '@/modules/auth/auth.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientId?: string;
	programId?: string;
	sessionType: Session['type'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export const RecipientDialog = ({
	open,
	onOpenChange,
	recipientId,
	programId,
	sessionType,
	errorMessage,
	onError,
}: Props) => {
	const handleError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error saving recipient: ${errorMessage}`);
		console.error('Recipient Form Error', { error });
	};

	const dialogTitle = recipientId ? 'Edit Recipient' : 'New Recipient';

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}

				<RecipientForm
					recipientId={recipientId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={handleError}
					programId={programId}
					sessionType={sessionType}
				/>
			</DialogContent>
		</Dialog>
	);
};
