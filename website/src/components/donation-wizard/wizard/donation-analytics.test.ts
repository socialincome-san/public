import { getDonationCompletedEvent, getDonationFunnelEvent } from './donation-analytics';
import { type DonationWizardContext, getInitialWizardContext } from './donation-wizard-context';

const context = (overrides: Partial<DonationWizardContext>): DonationWizardContext => ({
	...getInitialWizardContext(),
	...overrides,
});

describe('getDonationFunnelEvent', () => {
	it('ignores events that did not change the step', () => {
		expect(getDonationFunnelEvent('SUBMIT', false, context({}), 'CHF')).toBeNull();
		expect(getDonationFunnelEvent('SET_CADENCE', true, context({}), 'CHF')).toBeNull();
	});

	it('leaves out the preselected payment method before the donor chose one', () => {
		const event = getDonationFunnelEvent('SUBMIT', true, context({ selectedAmount: 50, cadence: 'one-time' }), 'USD');

		expect(event).toEqual({
			name: 'donation_amount_confirmed',
			properties: { value: 50, currency: 'USD', donation_type: 'one_time', payment_method: undefined },
		});
	});

	it('reports the charged amount including covered transaction costs for online payments', () => {
		const event = getDonationFunnelEvent(
			'START_STRIPE_CHECKOUT',
			true,
			context({ selectedAmount: 50, cadence: 'monthly', paymentMethod: 'online', coverTransactionCosts: true }),
			'CHF',
		);

		expect(event?.name).toBe('donation_online_payment_click');
		expect(event?.properties).toMatchObject({ donation_type: 'recurring', payment_method: 'credit_card' });
		expect(event?.properties.value).toBeGreaterThan(50);
	});

	it('uses the completed donation summary after payment', () => {
		const event = getDonationFunnelEvent(
			'DONATION_ONBOARDING_PERSONAL_COMPLETE',
			true,
			context({ paymentMethod: 'qr', completedDonationSummary: { amount: 120, cadence: 'one-time' } }),
			'CHF',
		);

		expect(event).toEqual({
			name: 'donation_account_confirmed',
			properties: { value: 120, currency: 'CHF', donation_type: 'one_time', payment_method: 'qr' },
		});
	});
});

describe('getDonationCompletedEvent', () => {
	it('builds the GA4 purchase parameters from the paid checkout', () => {
		expect(
			getDonationCompletedEvent({
				checkoutSessionId: 'cs_123',
				amount: 51.5,
				currency: 'CHF',
				recurring: true,
				donorStatus: 'returning',
			}),
		).toEqual({
			name: 'donation_completed',
			properties: {
				value: 51.5,
				currency: 'CHF',
				donation_type: 'recurring',
				payment_method: 'credit_card',
				donor_status: 'returning',
				transaction_id: 'cs_123',
				items: [{ item_id: 'donation', item_name: 'Donation', price: 51.5, quantity: 1 }],
			},
		});
	});
});
