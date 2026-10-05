import type { SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { SUBSCRIPTION_CANCEL_REASONS } from '@/modules/subscriptions/subscription.types';

const SUBSCRIPTION_CANCEL_RETENTION_PRESETS = [15, 10, 5] as const;

export const getSubscriptionCancelRetentionPresets = (currentAmount: number): number[] =>
	SUBSCRIPTION_CANCEL_RETENTION_PRESETS.filter((preset) => preset < currentAmount);

export const isSubscriptionCancellationReason = (value: string): value is SubscriptionCancellationReason =>
	SUBSCRIPTION_CANCEL_REASONS.some((reason) => reason === value);
