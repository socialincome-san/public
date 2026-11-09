'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { campaignContributionsTableConfig } from '@/components/data-table/configs/contributions-table.config';
import { subscriptionsTableConfig } from '@/components/data-table/configs/subscriptions-table.config';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { getContributionTableViewAction } from '@/modules/contributions/contribution.actions';
import { getSubscriptionTableViewAction } from '@/modules/subscriptions/subscription.actions';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useTranslations } from 'next-intl';
import { translateManagementTableConfig } from '../management-table-config';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaign: CampaignTableViewRow;
};

export const CampaignDialog = ({ open, onOpenChange, campaign }: Props) => {
	const t = useTranslations('portal-management');
	const campaignId = campaign.id;
	const contributionConfig = translateManagementTableConfig(campaignContributionsTableConfig, {
		title: t('tables.contributions.title'),
		emptyMessage: t('tables.contributions.empty'),
		columns: {
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			amount: t('columns.amount'),
			createdAt: t('columns.createdAt'),
		},
	});
	const subscriptionConfig = translateManagementTableConfig(subscriptionsTableConfig, {
		title: t('tables.subscriptions.title'),
		emptyMessage: t('tables.subscriptions.empty'),
		columns: {
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			amount: t('columns.amount'),
			status: t('columns.status'),
			cancellationReason: t('columns.cancellationReason'),
			paymentMethod: t('columns.paymentMethod'),
			stripeSubscriptionId: t('columns.stripeSubscriptionId'),
			bankStandingOrderReference: t('columns.bankStandingOrderReference'),
			createdAt: t('columns.createdAt'),
		},
	});

	return (
		<TabbedDialog
			open={open}
			onOpenChange={onOpenChange}
			title={campaign.title}
			description={campaign.programName ?? undefined}
			tabs={[
				{
					value: 'contributions',
					label: t('navigation.contributions'),
					content: (
						<RecordTableTab
							config={contributionConfig}
							load={(query) => getContributionTableViewAction({ ...query, campaignId })}
							getRowHref={(row) =>
								`/portal/management/contributions?${new URLSearchParams({ campaignId, contributionId: row.id })}`
							}
						/>
					),
				},
				{
					value: 'subscriptions',
					label: t('navigation.subscriptions'),
					content: (
						<RecordTableTab
							config={subscriptionConfig}
							load={(query) => getSubscriptionTableViewAction({ ...query, campaignId })}
						/>
					),
				},
				{ ...auditLogTab('campaign', campaignId), label: t('dialogs.auditLog') },
			]}
		/>
	);
};
