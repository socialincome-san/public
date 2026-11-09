'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { contributorContributionsTableConfig } from '@/components/data-table/configs/contributions-table.config';
import { contributorDonationCertificatesTableConfig } from '@/components/data-table/configs/donation-certificates-table.config';
import { contributorSubscriptionsTableConfig } from '@/components/data-table/configs/subscriptions-table.config';
import { getContributionTableViewAction } from '@/modules/contributions/contribution.actions';
import { getDonationCertificateTableViewAction } from '@/modules/donation-certificates/donation-certificate.actions';
import { getSubscriptionTableViewAction } from '@/modules/subscriptions/subscription.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useTranslations } from 'next-intl';
import { translateManagementTableConfig } from '../management-table-config';
import ContributorsForm from './contributors-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contributorId?: string;
	errorMessage: string | null;
	onError: (error: unknown) => void;
};

export const ContributorDialog = ({ open, onOpenChange, contributorId, errorMessage, onError }: Props) => {
	const t = useTranslations('portal-management');
	const contributionConfig = translateManagementTableConfig(contributorContributionsTableConfig, {
		title: t('tables.contributions.title'),
		emptyMessage: t('tables.contributions.empty'),
		columns: {
			amount: t('columns.amount'),
			campaignTitle: t('columns.campaignTitle'),
			programName: t('columns.programName'),
			createdAt: t('columns.createdAt'),
		},
	});
	const subscriptionConfig = translateManagementTableConfig(contributorSubscriptionsTableConfig, {
		title: t('tables.subscriptions.title'),
		emptyMessage: t('tables.subscriptions.empty'),
		columns: {
			amount: t('columns.amount'),
			status: t('columns.status'),
			cancellationReason: t('columns.cancellationReason'),
			paymentMethod: t('columns.paymentMethod'),
			stripeSubscriptionId: t('columns.stripeSubscriptionId'),
			bankStandingOrderReference: t('columns.bankStandingOrderReference'),
			createdAt: t('columns.createdAt'),
		},
	});
	const donationCertificateConfig = translateManagementTableConfig(contributorDonationCertificatesTableConfig, {
		title: t('tables.donationCertificates.title'),
		emptyMessage: t('tables.donationCertificates.empty'),
		columns: {
			year: t('columns.year'),
			storagePath: t('columns.storagePath'),
			createdAt: t('columns.createdAt'),
		},
	});
	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('dialogs.error')}</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<ContributorsForm
				contributorId={contributorId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={onError}
			/>
		</>
	);

	if (contributorId) {
		const linkParams = (key: string, id: string) => new URLSearchParams({ contributorId, [key]: id });

		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title={t('dialogs.editContributor')}
				tabs={[
					{ value: 'details', label: t('dialogs.details'), content: form },
					{
						value: 'contributions',
						label: t('navigation.contributions'),
						content: (
							<RecordTableTab
								config={contributionConfig}
								load={(query) => getContributionTableViewAction({ ...query, contributorId })}
								getRowHref={(row) => `/portal/management/contributions?${linkParams('contributionId', row.id)}`}
							/>
						),
					},
					{
						value: 'subscriptions',
						label: t('navigation.subscriptions'),
						content: (
							<RecordTableTab
								config={subscriptionConfig}
								load={(query) => getSubscriptionTableViewAction({ ...query, contributorId })}
							/>
						),
					},
					{
						value: 'donation-certificates',
						label: t('navigation.donationCertificates'),
						content: (
							<RecordTableTab
								config={donationCertificateConfig}
								load={(query) => getDonationCertificateTableViewAction({ ...query, contributorId })}
							/>
						),
					},
					{ ...auditLogTab('contributor', contributorId), label: t('dialogs.auditLog') },
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{t('dialogs.newContributor')}</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
