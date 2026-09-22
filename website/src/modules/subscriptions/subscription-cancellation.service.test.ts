import {
	getSubscriptionCancelRetentionPresets,
	isSubscriptionCancellationReason,
} from '@/app/[lang]/[region]/dashboard/subscriptions/subscription-cancellation';
import { subscriptionCancellation } from './subscription-cancellation.service';

describe('subscription cancellation helpers', () => {
	test('maps cancellation reasons to Stripe feedback', () => {
		expect(subscriptionCancellation.mapReasonToStripeFeedback('financial_situation_changed')).toBe('too_expensive');
		expect(subscriptionCancellation.mapReasonToStripeFeedback('different_cause')).toBe('switched_service');
		expect(subscriptionCancellation.mapReasonToStripeFeedback('not_enough_updates')).toBe('missing_features');
		expect(subscriptionCancellation.mapReasonToStripeFeedback('pausing')).toBe('unused');
		expect(subscriptionCancellation.mapReasonToStripeFeedback('other')).toBe('other');
	});

	test('validates cancellation reason values', () => {
		expect(isSubscriptionCancellationReason('other')).toBe(true);
		expect(isSubscriptionCancellationReason('invalid')).toBe(false);
	});

	test('filters retention presets to values below the current amount', () => {
		expect(getSubscriptionCancelRetentionPresets(8)).toEqual([5]);
		expect(getSubscriptionCancelRetentionPresets(5)).toEqual([]);
		expect(getSubscriptionCancelRetentionPresets(30)).toEqual([15, 10, 5]);
	});
});
