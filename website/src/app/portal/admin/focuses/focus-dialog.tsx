'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { focusLocalPartnersTableConfig } from '@/components/data-table/configs/local-partners-table.config';
import { focusProgramsTableConfig } from '@/components/data-table/configs/programs-table.config';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { getLocalPartnerTableViewAction } from '@/modules/local-partners/local-partner.actions';
import { getProgramTableViewAction } from '@/modules/programs/program.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useTranslations } from 'next-intl';
import FocusesForm from './focuses-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	focusId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const FocusDialog = ({ open, onOpenChange, focusId, errorMessage, onError }: Props) => {
	const t = useTranslations('portal-admin');
	const handleError = (error: unknown) => {
		const action = focusId ? 'updating/deleting' : 'creating';
		const message = retrieveErrorMessage(error);
		onError(`Error ${action} focus: ${message}`);
		console.error('Focus Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			<FocusesForm
				focusId={focusId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
			/>
		</>
	);

	if (focusId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title={t('dialog.editFocus')}
				tabs={[
					{ value: 'details', label: t('common.details'), content: form },
					{
						value: 'programs',
						label: t('common.programs'),
						content: (
							<RecordTableTab
								config={focusProgramsTableConfig}
								load={(query) => getProgramTableViewAction({ ...query, focusId })}
								getRowHref={(row) => `/portal/programs/${row.id}/overview`}
							/>
						),
					},
					{
						value: 'local-partners',
						label: t('common.localPartners'),
						content: (
							<RecordTableTab
								config={focusLocalPartnersTableConfig}
								load={(query) => getLocalPartnerTableViewAction({ ...query, focusId })}
								getRowHref={(row) =>
									`/portal/admin/local-partners?${new URLSearchParams({ focusId, localPartnerId: row.id })}`
								}
							/>
						),
					},
					auditLogTab('focus', focusId),
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{t('dialog.addFocus')}</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
