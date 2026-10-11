import { z } from 'zod';
import { SUBSCRIPTION_AMOUNT_MAX, SUBSCRIPTION_AMOUNT_MIN, SUBSCRIPTION_CANCEL_REASONS } from './subscription.types';

export const subscriptionIdSchema = z.string().trim().min(1, 'Subscription id is required.');

export const updateSubscriptionAmountSchema = z.object({
	subscriptionId: subscriptionIdSchema,
	amount: z.number().int().min(SUBSCRIPTION_AMOUNT_MIN).max(SUBSCRIPTION_AMOUNT_MAX),
	coverTransactionCosts: z.boolean().optional(),
});

export const cancelSubscriptionSchema = z.object({
	subscriptionId: subscriptionIdSchema,
	reason: z.enum(SUBSCRIPTION_CANCEL_REASONS),
});
