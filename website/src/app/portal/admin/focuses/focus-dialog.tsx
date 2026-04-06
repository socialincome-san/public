'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
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
		logger.error('Focus Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{focusId ? 'Edit' : 'Add'} focus</DialogTitle>
				</DialogHeader>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
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
