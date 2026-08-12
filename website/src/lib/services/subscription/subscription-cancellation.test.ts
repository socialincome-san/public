import { isSubscriptionCancellationReason, mapCancellationReasonToStripeFeedback } from './subscription-cancellation';

describe('subscription-cancellation', () => {
	test('maps cancellation reasons to Stripe feedback', () => {
		expect(mapCancellationReasonToStripeFeedback('financial_situation_changed')).toBe('too_expensive');
		expect(mapCancellationReasonToStripeFeedback('different_cause')).toBe('switched_service');
		expect(mapCancellationReasonToStripeFeedback('not_enough_updates')).toBe('missing_features');
		expect(mapCancellationReasonToStripeFeedback('pausing')).toBe('unused');
		expect(mapCancellationReasonToStripeFeedback('other')).toBe('other');
	});

	test('validates cancellation reason values', () => {
		expect(isSubscriptionCancellationReason('other')).toBe(true);
		expect(isSubscriptionCancellationReason('invalid')).toBe(false);
	});
});
