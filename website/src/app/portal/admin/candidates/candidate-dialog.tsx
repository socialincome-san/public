'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { Session } from '@/modules/auth/auth.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
	const handleError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		onError(t('status.errorSavingCandidate', { error: errorMessage }));
		console.error('Candidate Form Error', { error });
	};

	return (
		<RecordDialog
			open={open}
			onOpenChange={onOpenChange}
			title={candidateId ? t('dialog.editCandidate') : t('dialog.newCandidate')}
			tabs={candidateId && sessionType === 'user' ? [auditLogTab('recipient', candidateId)] : []}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
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
