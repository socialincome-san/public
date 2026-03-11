'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { logger } from '@/lib/utils/logger';
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
		const errorMessage =
			error instanceof Error
				? error.message
				: typeof error === 'string'
					? error
					: 'An unexpected error occurred while saving.';
		onError(`Error ${action} country: ${errorMessage}`);
		logger.error('Country Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{countryId ? 'Edit' : 'Add'} country</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
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
