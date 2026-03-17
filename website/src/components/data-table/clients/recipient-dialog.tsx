'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { RecipientForm } from '@/components/recipient/recipient-form';
import type { Session } from '@/lib/firebase/current-account';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientId?: string;
	readOnly: boolean;
	programId?: string;
	sessionType: Session['type'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export const RecipientDialog = ({
	open,
	onOpenChange,
	recipientId,
	readOnly,
	programId,
	sessionType,
	errorMessage,
	onError,
}: Props) => {
	const handleError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error saving recipient: ${errorMessage}`);
		logger.error('Recipient Form Error', { error });
	};

	let dialogTitle = 'New Recipient';
	if (readOnly) {
		dialogTitle = 'View Recipient';
	} else if (recipientId) {
		dialogTitle = 'Edit Recipient';
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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

				<RecipientForm
					recipientId={recipientId}
					readOnly={readOnly}
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
