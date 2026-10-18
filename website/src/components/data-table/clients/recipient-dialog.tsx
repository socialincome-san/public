'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { recipientPayoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import { recipientSurveysTableConfig } from '@/components/data-table/configs/surveys-table.config';
import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { RecipientForm } from '@/components/recipient/recipient-form';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { Session } from '@/modules/auth/auth.types';
import { getPayoutTableViewAction } from '@/modules/payouts/payout.actions';
import { getSurveyTableViewAction } from '@/modules/surveys/survey.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientId?: string;
	programId?: string;
	sessionType: Session['type'];
	errorMessage: string | null;
	onError: (error: string) => void;
};

export const RecipientDialog = ({
	open,
	onOpenChange,
	recipientId,
	programId,
	sessionType,
	errorMessage,
	onError,
}: Props) => {
	const { t } = usePortalSharedTranslations();
	const handleError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		onError(errorMessage);
		console.error('Recipient Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('form.error', 'Error')}</AlertTitle>
					<AlertDescription>
						{t('form.recipientSaveError', 'Error saving recipient:')} {errorMessage}
					</AlertDescription>
				</Alert>
			)}

			<RecipientForm
				recipientId={recipientId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
				programId={programId}
				sessionType={sessionType}
			/>
		</>
	);

	// The tabs need a portal user session; their services limit rows to operated programs
	if (recipientId && sessionType === 'user') {
		const linkParams = (key: string, id: string) => new URLSearchParams({ recipientId, [key]: id });

		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title={t('dialog.editRecipient', 'Edit Recipient')}
				tabs={[
					{ value: 'details', label: t('dialog.details', 'Details'), content: form },
					{
						value: 'payouts',
						label: t('dialog.payouts', 'Payouts'),
						content: (
							<RecordTableTab
								config={recipientPayoutsTableConfig}
								load={(query) => getPayoutTableViewAction({ ...query, recipientId })}
								getRowHref={(row) => `/portal/delivery/payouts?${linkParams('payoutId', row.id)}`}
							/>
						),
					},
					{
						value: 'surveys',
						label: t('dialog.surveys', 'Surveys'),
						content: (
							<RecordTableTab
								config={recipientSurveysTableConfig}
								load={(query) => getSurveyTableViewAction({ ...query, recipientId })}
								getRowHref={(row) => `/portal/management/surveys?${linkParams('surveyId', row.id)}`}
							/>
						),
					},
					{ ...auditLogTab('recipient', recipientId), label: t('tab.auditLog', 'Audit log') },
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>
						{recipientId ? t('dialog.editRecipient', 'Edit Recipient') : t('dialog.newRecipient', 'New Recipient')}
					</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
