import { createActor, fromPromise } from 'xstate';
import { editSubscriptionMachine } from './edit-subscription-machine';

jest.mock('@/lib/server-actions/subscription-actions', () => ({
	updateSubscriptionAmountAction: jest.fn(),
	cancelSubscriptionAction: jest.fn(),
}));

const openEvent = {
	type: 'OPEN' as const,
	subscription: {
		subscriptionId: 'sub_db_1',
		initialAmount: 30,
		currency: 'CHF' as const,
		paymentMethod: 'stripe' as const,
		brand: 'Visa',
		last4: '4242',
	},
};

const waitFor = async (predicate: () => boolean, timeoutMs = 2000) => {
	const startedAt = Date.now();
	while (!predicate()) {
		if (Date.now() - startedAt > timeoutMs) {
			throw new Error('Timed out waiting for condition');
		}
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
};

describe('editSubscriptionMachine', () => {
	test('blocks submit when amount is unchanged', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'SUBMIT' });

		expect(actor.getSnapshot().matches('editing')).toBe(true);
	});

	test('allows submit when only cover transaction costs changes', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'SET_COVER_TRANSACTION_COSTS', value: true });

		expect(actor.getSnapshot().can({ type: 'SUBMIT' })).toBe(true);
	});

	test('preselects cover transaction costs when opening from nudge', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send({
			...openEvent,
			subscription: {
				...openEvent.subscription,
				coverTransactionCosts: false,
				preselectCoverTransactionCosts: true,
			},
		});

		expect(actor.getSnapshot().context.coverTransactionCosts).toBe(true);
		expect(actor.getSnapshot().context.initialCoverTransactionCosts).toBe(false);
		expect(actor.getSnapshot().can({ type: 'SUBMIT' })).toBe(true);
	});

	test('returns to editing with error on failed submit', async () => {
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					updateAmount: fromPromise<
						{ amount: number; currency: string },
						{ subscriptionId: string; amount: number; coverTransactionCosts?: boolean }
					>(() => Promise.reject(new Error('Stripe failed'))),
				},
			}),
		).start();

		actor.send(openEvent);
		actor.send({ type: 'SET_AMOUNT', value: 40 });
		actor.send({ type: 'SUBMIT' });

		await waitFor(() => actor.getSnapshot().matches('editing') && actor.getSnapshot().context.error === 'failed');
	});

	test('retention preset returns to editing with prefilled amount', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'REDUCE_AMOUNT', value: 15 });

		expect(actor.getSnapshot().matches('editing')).toBe(true);
		expect(actor.getSnapshot().context.amount).toBe(15);
	});

	test('blocks confirm cancel without reason', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'CONTINUE_CANCEL' });
		actor.send({ type: 'CONFIRM_CANCEL' });

		expect(actor.getSnapshot().matches('reason')).toBe(true);
	});

	test('returns to reason with error on failed cancel', async () => {
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					cancelSubscription: fromPromise(() => Promise.reject(new Error('Stripe failed'))),
				},
			}),
		).start();

		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'CONTINUE_CANCEL' });
		actor.send({ type: 'SET_CANCEL_REASON', value: 'other' });
		actor.send({ type: 'CONFIRM_CANCEL' });

		await waitFor(() => actor.getSnapshot().matches('reason') && actor.getSnapshot().context.error === 'failed');
	});

	test('ignores CLOSE while submitting', async () => {
		let resolveUpdate: ((value: { amount: number; currency: string }) => void) | undefined;
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					updateAmount: fromPromise(
						() =>
							new Promise<{ amount: number; currency: string }>((resolve) => {
								resolveUpdate = resolve;
							}),
					),
				},
			}),
		).start();

		actor.send(openEvent);
		actor.send({ type: 'SET_AMOUNT', value: 40 });
		actor.send({ type: 'SUBMIT' });
		await waitFor(() => actor.getSnapshot().matches('submitting'));

		actor.send({ type: 'CLOSE' });
		expect(actor.getSnapshot().matches('submitting')).toBe(true);

		resolveUpdate?.({ amount: 40, currency: 'CHF' });
		await waitFor(() => actor.getSnapshot().matches('success'));
		expect(actor.getSnapshot().context.initialAmount).toBe(40);
	});
});
