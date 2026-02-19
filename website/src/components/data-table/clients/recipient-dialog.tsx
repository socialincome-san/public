'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { RecipientForm } from '@/components/recipient/recipient-form';
import { Actor } from '@/lib/firebase/current-account';
import { logger } from '@/lib/utils/logger';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientId?: string;
	readOnly: boolean;
	programId?: string;
	actorKind: Actor['kind'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export const RecipientDialog = ({
	open,
	onOpenChange,
	recipientId,
	readOnly,
	programId,
	actorKind,
	errorMessage,
	onError,
}: Props) => {
	const handleError = (error: unknown) => {
		onError(`Error saving recipient: ${error}`);
		logger.error('Recipient Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{readOnly ? 'View Recipient' : recipientId ? 'Edit Recipient' : 'New Recipient'}</DialogTitle>
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
					actorKind={actorKind}
				/>
			</DialogContent>
		</Dialog>
	);
};
