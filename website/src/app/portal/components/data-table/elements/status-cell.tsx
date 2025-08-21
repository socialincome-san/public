'use client';

import { CellType } from '@/app/portal/components/data-table/elements/types';
import { ContributionStatus, PayoutStatus, RecipientStatus, SurveyStatus } from '@prisma/client';

import { CampaignStatusBadge } from '@/app/portal/components/badges/campaign-status-badge';
import { ContributionStatusBadge } from '@/app/portal/components/badges/contribution-status-badge';
import { PayoutStatusBadge } from '@/app/portal/components/badges/payout-status-badge';
import { RecipientStatusBadge } from '@/app/portal/components/badges/recipient-status-badge';
import { SurveyStatusBadge } from '@/app/portal/components/badges/survey-status-badge';

type StatusVariant = 'contribution' | 'payout' | 'recipient' | 'survey' | 'campaign';

type Props<TData, TValue> = CellType<TData, TValue> & {
	variant: StatusVariant;
};

export function StatusCell<TData, TValue>({ ctx, variant }: Props<TData, TValue>) {
	const value = ctx.getValue();

	switch (variant) {
		case 'contribution':
			return <ContributionStatusBadge status={value as ContributionStatus} />;
		case 'payout':
			return <PayoutStatusBadge status={value as PayoutStatus} />;
		case 'recipient':
			return <RecipientStatusBadge status={value as RecipientStatus} />;
		case 'survey':
			return <SurveyStatusBadge status={value as SurveyStatus} />;
		case 'campaign':
			return <CampaignStatusBadge status={!!value} />;
		default:
			return null;
	}
}
