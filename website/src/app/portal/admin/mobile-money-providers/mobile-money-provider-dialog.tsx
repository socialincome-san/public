'use client';

import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/dialog/dialog';
import MobileMoneyProvidersForm from './mobile-money-providers-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const MobileMoneyProviderDialog = ({ open, onOpenChange, providerId, errorMessage, onError }: Props) => {
	const handleError = (error: unknown) => {
		const action = providerId ? 'updating/deleting' : 'creating';
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error ${action} mobile money provider: ${errorMessage}`);
		console.error('Mobile Money Provider Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{providerId ? 'Edit' : 'Add'} mobile money provider</DialogTitle>
				</DialogHeader>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}
				<MobileMoneyProvidersForm
					providerId={providerId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={handleError}
				/>
			</DialogContent>
		</Dialog>
	);
};
