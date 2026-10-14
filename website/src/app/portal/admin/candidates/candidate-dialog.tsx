'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { Session } from '@/modules/auth/auth.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { CandidateForm } from './candidates-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidateId?: string;
	sessionType: Session['type'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export const CandidateDialog = ({ open, onOpenChange, candidateId, sessionType, errorMessage, onError }: Props) => {
	const handleError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error saving candidate: ${errorMessage}`);
		console.error('Candidate Form Error', { error });
	};

	const dialogTitle = candidateId ? 'Edit Candidate' : 'New Candidate';

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<CandidateForm
				candidateId={candidateId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
				sessionType={sessionType}
			/>
		</>
	);

	if (candidateId && sessionType === 'user') {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title="Edit Candidate"
				tabs={[{ value: 'details', label: 'Details', content: form }, auditLogTab('recipient', candidateId)]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
