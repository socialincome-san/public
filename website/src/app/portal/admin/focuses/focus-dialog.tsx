'use client';

import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import FocusesForm from './focuses-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	focusId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const FocusDialog = ({ open, onOpenChange, focusId, errorMessage, onError }: Props) => {
	const handleError = (error: unknown) => {
		const action = focusId ? 'updating/deleting' : 'creating';
		const message = retrieveErrorMessage(error);
		onError(`Error ${action} focus: ${message}`);
		console.error('Focus Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{focusId ? 'Edit' : 'Add'} focus</DialogTitle>
				</DialogHeader>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}
				<FocusesForm
					focusId={focusId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={handleError}
				/>
			</DialogContent>
		</Dialog>
	);
};
