'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { getErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { ProgramSettingsForm } from './program-settings-form';

type ProgramSettingsDialogProps = {
	programId: string;
	readOnly: boolean;
};

export const ProgramSettingsDialog = ({ programId, readOnly }: ProgramSettingsDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleError = (error: unknown) => {
		const message = getErrorMessage(error);
		setErrorMessage(`Error updating program settings: ${message}`);
		logger.error('Program Settings Form Error', { error });
	};

	const closeDialog = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setErrorMessage(null);
		}
	};

	return (
		<>
			<Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
				<Settings className="size-4" />
				Program settings
			</Button>

			<Dialog open={isOpen} onOpenChange={closeDialog}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{readOnly ? 'View program settings' : 'Program settings'}</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}

					<ProgramSettingsForm
						programId={programId}
						readOnly={readOnly}
						onSuccess={() => closeDialog(false)}
						onCancel={() => closeDialog(false)}
						onError={handleError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
