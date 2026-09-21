import { resolveStripeResourceId, resolveStripeSubscriptionIdFromInvoice } from './stripe.integration';

describe('resolveStripeResourceId', () => {
	test('returns string ids, object ids, and null', () => {
		expect(resolveStripeResourceId('cus_1')).toBe('cus_1');
		expect(resolveStripeResourceId({ id: 'cus_2' })).toBe('cus_2');
		expect(resolveStripeResourceId(null)).toBe(null);
		expect(resolveStripeResourceId(undefined)).toBe(null);
	});
});

describe('resolveStripeSubscriptionIdFromInvoice', () => {
	test('reads the parent subscription details first', () => {
		expect(
			resolveStripeSubscriptionIdFromInvoice({
				parent: { subscription_details: { subscription: 'sub_parent' } },
			}),
		).toBe('sub_parent');
	});

	test('falls back to the legacy subscription field', () => {
		expect(
			resolveStripeSubscriptionIdFromInvoice({
				subscription: { id: 'sub_legacy' },
			}),
		).toBe('sub_legacy');
	});
});
