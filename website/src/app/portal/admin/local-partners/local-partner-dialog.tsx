'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { localPartnerCandidatesTableConfig } from '@/components/data-table/configs/candidates-table.config';
import { localPartnerRecipientsTableConfig } from '@/components/data-table/configs/recipients-table.config';
import { getCandidateTableViewAction } from '@/modules/candidates/candidate.actions';
import { getRecipientTableViewAction } from '@/modules/recipients/recipient.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useTranslations } from 'next-intl';
import LocalPartnersForm from './local-partners-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	localPartnerId?: string;
	errorMessage: string | null;
	onError: (error: unknown) => void;
};

export const LocalPartnerDialog = ({ open, onOpenChange, localPartnerId, errorMessage, onError }: Props) => {
	const t = useTranslations('portal-admin');
	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			<LocalPartnersForm
				localPartnerId={localPartnerId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={onError}
			/>
		</>
	);

	if (localPartnerId) {
		const linkParams = (key: string, id: string) => new URLSearchParams({ localPartnerId, [key]: id });

		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title={t('dialog.editLocalPartner')}
				tabs={[
					{ value: 'details', label: t('common.details'), content: form },
					{
						value: 'recipients',
						label: t('common.recipients'),
						content: (
							<RecordTableTab
								config={localPartnerRecipientsTableConfig}
								load={(query) => getRecipientTableViewAction({ ...query, localPartnerId })}
								getRowHref={(row) => `/portal/management/recipients?${linkParams('recipientId', row.id)}`}
							/>
						),
					},
					{
						value: 'candidates',
						label: t('common.candidates'),
						content: (
							<RecordTableTab
								config={localPartnerCandidatesTableConfig}
								load={(query) => getCandidateTableViewAction({ ...query, localPartnerId })}
								getRowHref={(row) => `/portal/admin/candidates?${linkParams('candidateId', row.id)}`}
							/>
						),
					},
					auditLogTab('local-partner', localPartnerId),
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{t('dialog.addLocalPartner')}</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
