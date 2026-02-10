'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Actor } from '@/lib/firebase/current-account';
import { logger } from '@/lib/utils/logger';
import { CandidateForm } from './candidates-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidateId?: string;
	readOnly: boolean;
	actorKind: Actor['kind'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export function CandidateDialog({
	open,
	onOpenChange,
	candidateId,
	readOnly,
	actorKind,
	errorMessage,
	onError,
}: Props) {
	const handleError = (error: unknown) => {
		onError(`Error saving candidate: ${error}`);
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
					onError={handleError}
					actorKind={actorKind}
				/>
			</DialogContent>
		</Dialog>
	);
}
