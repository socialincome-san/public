'use client';

import { CellType } from '@/components/data-table/elements/types';
import { ContributionStatus, PayoutStatus, RecipientStatus, SurveyStatus } from '@/generated/prisma/client';

import { BooleanBadge } from '@/components/badges/boolean-badge';
import { CampaignStatusBadge } from '@/components/badges/campaign-status-badge';
import { ContributionStatusBadge } from '@/components/badges/contribution-status-badge';
import { PayoutStatusBadge } from '@/components/badges/payout-status-badge';
import { RecipientStatusBadge } from '@/components/badges/recipient-status-badge';
import { SubscriptionStatus, SubscriptionStatusBadge } from '@/components/badges/subscription-status-badge';
import { SurveyStatusBadge } from '@/components/badges/survey-status-badge';

type StatusVariant = 'contribution' | 'payout' | 'recipient' | 'survey' | 'campaign' | 'subscription' | 'boolean';

type Props<TData, TValue> = CellType<TData, TValue> & {
	variant: StatusVariant;
	label?: string;
};

export function StatusCell<TData, TValue>({ ctx, variant, label }: Props<TData, TValue>) {
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
		case 'subscription':
			return <SubscriptionStatusBadge status={value as SubscriptionStatus} label={label || (value as string)} />;
		case 'boolean':
			return <BooleanBadge value={!!value} />;
		default:
			return null;
	}
}
