'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { useState } from 'react';
import { PayoutForm } from './payout-form';

type PayoutFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payoutId?: string;
};

export const PayoutFormDialog = ({ open, onOpenChange, payoutId }: PayoutFormDialogProps) => {
	const t = usePortalOperationsTranslations();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const onError = (error?: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(t('delivery.payouts.error_saving', { message }));
		console.error('Payout Form Error', { error });
	};

	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setErrorMessage(null);
		}
	};

	return (
		<RecordDialog
			open={open}
			onOpenChange={handleOpenChange}
			title={payoutId ? t('delivery.payouts.edit_payout') : t('delivery.payouts.add_payout')}
			tabs={payoutId ? [auditLogTab('payout', payoutId)] : []}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<PayoutForm
				payoutId={payoutId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={onError}
			/>
		</RecordDialog>
	);
};
