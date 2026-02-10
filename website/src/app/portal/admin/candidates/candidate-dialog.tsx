'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Actor } from '@/lib/firebase/current-account';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { CandidateForm } from './candidates-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidateId?: string;
	readOnly: boolean;
	actorKind: Actor['kind'];
};

export function CandidateDialog({ open, onOpenChange, candidateId, readOnly, actorKind }: Props) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving candidate: ${error}`);
		logger.error('Candidate Form Error', { error });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{readOnly ? 'View Candidate' : candidateId ? 'Edit Candidate' : 'New Candidate'}</DialogTitle>
				</DialogHeader>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
					</Alert>
				)}

				<CandidateForm
					candidateId={candidateId}
					readOnly={readOnly}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={onError}
					actorKind={actorKind}
				/>
			</DialogContent>
		</Dialog>
	);
}
