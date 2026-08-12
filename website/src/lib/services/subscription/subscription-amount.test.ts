import {
	canUpdateSubscriptionAmount,
	clampSubscriptionAmount,
	isSubscriptionAmountInRange,
	parseSubscriptionAmountInput,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
} from './subscription-amount';

describe('subscription-amount', () => {
	test('clamps values into the allowed range', () => {
		expect(clampSubscriptionAmount(0)).toBe(SUBSCRIPTION_AMOUNT_MIN);
		expect(clampSubscriptionAmount(-10)).toBe(SUBSCRIPTION_AMOUNT_MIN);
		expect(clampSubscriptionAmount(2500.6)).toBe(2501);
		expect(clampSubscriptionAmount(SUBSCRIPTION_AMOUNT_MAX + 1)).toBe(SUBSCRIPTION_AMOUNT_MAX);
	});

	test('parses amount input strings', () => {
		expect(parseSubscriptionAmountInput('')).toBeNull();
		expect(parseSubscriptionAmountInput('abc')).toBeNull();
		expect(parseSubscriptionAmountInput('42')).toBe(42);
		expect(parseSubscriptionAmountInput(' 6000 ')).toBe(SUBSCRIPTION_AMOUNT_MAX);
	});

	test('validates range and update eligibility', () => {
		expect(isSubscriptionAmountInRange(30)).toBe(true);
		expect(isSubscriptionAmountInRange(0.5)).toBe(false);
		expect(isSubscriptionAmountInRange(SUBSCRIPTION_AMOUNT_MAX + 1)).toBe(false);
		expect(canUpdateSubscriptionAmount(30, 30)).toBe(false);
		expect(canUpdateSubscriptionAmount(31, 30)).toBe(true);
	});
});
