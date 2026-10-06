'use client';

import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/dialog/dialog';
import CountriesForm from './countries-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	countryId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const CountryDialog = ({ open, onOpenChange, countryId, errorMessage, onError }: Props) => {
	const handleError = (error: unknown) => {
		const action = countryId ? 'updating/deleting' : 'creating';
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error ${action} country: ${errorMessage}`);
		console.error('Country Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{countryId ? 'Edit' : 'Add'} country</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}

				<CountriesForm
					countryId={countryId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={handleError}
				/>
			</DialogContent>
		</Dialog>
	);
};
