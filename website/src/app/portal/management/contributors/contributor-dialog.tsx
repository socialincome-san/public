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
import ContributorsForm from './contributors-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contributorId?: string;
	errorMessage: string | null;
	onError: (error: unknown) => void;
};

export const ContributorDialog = ({ open, onOpenChange, contributorId, errorMessage, onError }: Props) => {
	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
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
				title="Edit Contributor"
				tabs={[
					{ value: 'details', label: 'Details', content: form },
					{
						value: 'contributions',
						label: 'Contributions',
						content: (
							<RecordTableTab
								config={contributorContributionsTableConfig}
								load={(query) => getContributionTableViewAction({ ...query, contributorId })}
								getRowHref={(row) => `/portal/management/contributions?${linkParams('contributionId', row.id)}`}
							/>
						),
					},
					{
						value: 'subscriptions',
						label: 'Subscriptions',
						content: (
							<RecordTableTab
								config={contributorSubscriptionsTableConfig}
								load={(query) => getSubscriptionTableViewAction({ ...query, contributorId })}
							/>
						),
					},
					{
						value: 'donation-certificates',
						label: 'Donation Certificates',
						content: (
							<RecordTableTab
								config={contributorDonationCertificatesTableConfig}
								load={(query) => getDonationCertificateTableViewAction({ ...query, contributorId })}
							/>
						),
					},
					auditLogTab('contributor', contributorId),
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Contributor</DialogTitle>
				</DialogHeader>

				{form}
			</DialogContent>
		</Dialog>
	);
};
