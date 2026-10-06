'use client';

import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
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
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error updating program settings: ${message}`);
		console.error('Program Settings Form Error', { error });
	};

	const closeDialog = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setErrorMessage(null);
		}
	};

	return (
		<>
			<Button variant="outline" onClick={() => setIsOpen(true)}>
				<Settings className="size-4" />
				Program settings
			</Button>

			<Dialog open={isOpen} onOpenChange={closeDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{readOnly ? 'View program settings' : 'Program settings'}</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
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
