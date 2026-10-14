'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { campaignContributionsTableConfig } from '@/components/data-table/configs/contributions-table.config';
import { subscriptionsTableConfig } from '@/components/data-table/configs/subscriptions-table.config';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { getContributionTableViewAction } from '@/modules/contributions/contribution.actions';
import { getSubscriptionTableViewAction } from '@/modules/subscriptions/subscription.actions';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaign: CampaignTableViewRow;
};

export const CampaignDialog = ({ open, onOpenChange, campaign }: Props) => {
	const campaignId = campaign.id;

	return (
		<TabbedDialog
			open={open}
			onOpenChange={onOpenChange}
			title={campaign.title}
			description={campaign.programName ?? undefined}
			tabs={[
				{
					value: 'contributions',
					label: 'Contributions',
					content: (
						<RecordTableTab
							config={campaignContributionsTableConfig}
							load={(query) => getContributionTableViewAction({ ...query, campaignId })}
							getRowHref={(row) =>
								`/portal/management/contributions?${new URLSearchParams({ campaignId, contributionId: row.id })}`
							}
						/>
					),
				},
				{
					value: 'subscriptions',
					label: 'Subscriptions',
					content: (
						<RecordTableTab
							config={subscriptionsTableConfig}
							load={(query) => getSubscriptionTableViewAction({ ...query, campaignId })}
						/>
					),
				},
				auditLogTab('campaign', campaignId),
			]}
		/>
	);
};
