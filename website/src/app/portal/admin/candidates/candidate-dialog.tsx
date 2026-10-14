'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { Session } from '@/modules/auth/auth.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
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

	return (
		<RecordDialog
			open={open}
			onOpenChange={onOpenChange}
			title={candidateId ? 'Edit Candidate' : 'New Candidate'}
			tabs={candidateId && sessionType === 'user' ? [auditLogTab('recipient', candidateId)] : []}
		>
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
		</RecordDialog>
	);
};
