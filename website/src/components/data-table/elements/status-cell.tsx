'use client';

import { CellType } from '@/components/data-table/elements/types';
import { ContributionStatus, PayoutStatus, RecipientStatus, SurveyStatus } from '@prisma/client';

import { CampaignStatusBadge } from '@/components/badges/campaign-status-badge';
import { ContributionStatusBadge } from '@/components/badges/contribution-status-badge';
import { PayoutStatusBadge } from '@/components/badges/payout-status-badge';
import { RecipientStatusBadge } from '@/components/badges/recipient-status-badge';
import { SurveyStatusBadge } from '@/components/badges/survey-status-badge';

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
