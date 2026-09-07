import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';

const SUBSCRIPTION_CANCEL_RETENTION_PRESETS = [15, 10, 5] as const;

export const getSubscriptionCancelRetentionPresets = (currentAmount: number): number[] =>
	SUBSCRIPTION_CANCEL_RETENTION_PRESETS.filter((preset) => preset < currentAmount);

export const SUBSCRIPTION_CANCEL_REASONS = [
	'financial_situation_changed',
	'different_cause',
	'not_enough_updates',
	'technical_issue',
	'prefer_one_time',
	'pausing',
	'other',
] as const satisfies readonly SubscriptionCancellationReason[];

export const isSubscriptionCancellationReason = (value: string): value is SubscriptionCancellationReason =>
	SUBSCRIPTION_CANCEL_REASONS.includes(value as SubscriptionCancellationReason);

export const mapCancellationReasonToStripeFeedback = (
	reason: SubscriptionCancellationReason,
): 'too_expensive' | 'switched_service' | 'missing_features' | 'unused' | 'other' => {
	switch (reason) {
		case 'financial_situation_changed':
			return 'too_expensive';
		case 'different_cause':
			return 'switched_service';
		case 'not_enough_updates':
			return 'missing_features';
		case 'pausing':
			return 'unused';
		case 'technical_issue':
		case 'prefer_one_time':
		case 'other':
			return 'other';
	}
};
