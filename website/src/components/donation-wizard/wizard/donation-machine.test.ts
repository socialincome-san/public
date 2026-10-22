import { createActor, waitFor } from 'xstate';
import { donationWizardMachine } from './donation-machine';

jest.mock('@/modules/contributors/contributor.actions', () => ({
	getContributorCommunityStatsAction: jest.fn().mockResolvedValue({ success: false, error: 'Unavailable.' }),
}));

const startAtAmountStep = async () => {
	const actor = createActor(donationWizardMachine).start();
	actor.send({ type: 'OPEN', currency: 'EUR' });
	await waitFor(actor, (snapshot) => snapshot.matches('stepAmount'));

	return actor;
};

describe('donationWizardMachine currency', () => {
	it('starts with the currency it was opened with', async () => {
		const actor = await startAtAmountStep();

		expect(actor.getSnapshot().context.currency).toBe('EUR');
		expect(actor.getSnapshot().hasTag('currencyEditable')).toBe(true);
	});

	it('keeps the chosen currency and amount through the plan and payment steps', async () => {
		const actor = await startAtAmountStep();
		actor.send({ type: 'SET_PRESET_AMOUNT', value: 50 });
		actor.send({ type: 'SET_CURRENCY', value: 'USD' });
		actor.send({ type: 'SUBMIT' });
		actor.send({ type: 'SET_CURRENCY', value: 'CHF' });
		actor.send({ type: 'PROCEED_TO_PAYMENT' });

		const snapshot = actor.getSnapshot();
		expect(snapshot.matches('stepPayment')).toBe(true);
		expect(snapshot.context).toMatchObject({ currency: 'CHF', selectedAmount: 50 });
	});

	it('locks the currency once checkout has started', async () => {
		const actor = await startAtAmountStep();
		actor.send({ type: 'SUBMIT' });
		actor.send({ type: 'PROCEED_TO_PAYMENT' });
		actor.send({ type: 'SET_PAYMENT_METHOD', value: 'online' });
		actor.send({ type: 'START_STRIPE_CHECKOUT' });
		actor.send({ type: 'SET_CURRENCY', value: 'USD' });

		const snapshot = actor.getSnapshot();
		expect(snapshot.matches('stepStripeCheckout')).toBe(true);
		expect(snapshot.hasTag('currencyEditable')).toBe(false);
		expect(snapshot.context.currency).toBe('EUR');
	});

	it('falls back to the page currency when returning from Stripe without a stored context', () => {
		const actor = createActor(donationWizardMachine).start();
		actor.send({ type: 'OPEN_FROM_STRIPE_RETURN', context: null, sessionId: 'cs_123', currency: 'CHF' });

		expect(actor.getSnapshot().context.currency).toBe('CHF');
	});
});
