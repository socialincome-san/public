import { cancelSubscriptionSchema, updateSubscriptionAmountSchema } from './subscription.schemas';

describe('updateSubscriptionAmountSchema', () => {
	test('accepts a valid amount update', () => {
		expect(
			updateSubscriptionAmountSchema.parse({
				subscriptionId: 'sub-1',
				amount: 50,
				coverTransactionCosts: true,
			}),
		).toEqual({
			subscriptionId: 'sub-1',
			amount: 50,
			coverTransactionCosts: true,
		});
	});

	test('rejects a missing subscription id', () => {
		expect(updateSubscriptionAmountSchema.safeParse({ subscriptionId: '', amount: 50 }).success).toBe(false);
	});
});

describe('cancelSubscriptionSchema', () => {
	test('accepts a valid cancellation payload', () => {
		expect(
			cancelSubscriptionSchema.parse({
				subscriptionId: 'sub-1',
				reason: 'other',
			}),
		).toEqual({
			subscriptionId: 'sub-1',
			reason: 'other',
		});
	});

	test('rejects an invalid reason', () => {
		expect(cancelSubscriptionSchema.safeParse({ subscriptionId: 'sub-1', reason: 'invalid' }).success).toBe(false);
	});
});
