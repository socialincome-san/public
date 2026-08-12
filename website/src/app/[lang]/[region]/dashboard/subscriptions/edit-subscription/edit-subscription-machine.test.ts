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
	test('opens into editing with subscription context', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);

		expect(actor.getSnapshot().matches('editing')).toBe(true);
		expect(actor.getSnapshot().context.amount).toBe(30);
		expect(actor.getSnapshot().context.subscriptionId).toBe('sub_db_1');
	});

	test('blocks submit when amount is unchanged', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'SUBMIT' });

		expect(actor.getSnapshot().matches('editing')).toBe(true);
	});

	test('submits successfully and reaches success', async () => {
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					updateAmount: fromPromise(() => Promise.resolve({ amount: 40, currency: 'CHF' })),
				},
			}),
		).start();

		actor.send(openEvent);
		actor.send({ type: 'SET_AMOUNT', value: 40 });
		actor.send({ type: 'SUBMIT' });

		await waitFor(() => actor.getSnapshot().matches('success'));
	});

	test('returns to editing with error on failed submit', async () => {
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					updateAmount: fromPromise<{ amount: number; currency: string }, { subscriptionId: string; amount: number }>(() =>
						Promise.reject(new Error('Stripe failed')),
					),
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

	test('retention other returns to editing without changing amount', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'REDUCE_AMOUNT', value: 'other' });

		expect(actor.getSnapshot().matches('editing')).toBe(true);
		expect(actor.getSnapshot().context.amount).toBe(30);
	});

	test('blocks confirm cancel without reason', () => {
		const actor = createActor(editSubscriptionMachine).start();
		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'CONTINUE_CANCEL' });
		actor.send({ type: 'CONFIRM_CANCEL' });

		expect(actor.getSnapshot().matches('reason')).toBe(true);
	});

	test('cancels successfully and reaches canceledSuccess', async () => {
		const actor = createActor(
			editSubscriptionMachine.provide({
				actors: {
					cancelSubscription: fromPromise(() => Promise.resolve()),
				},
			}),
		).start();

		actor.send(openEvent);
		actor.send({ type: 'START_CANCEL' });
		actor.send({ type: 'CONTINUE_CANCEL' });
		actor.send({ type: 'SET_CANCEL_REASON', value: 'other' });
		actor.send({ type: 'CONFIRM_CANCEL' });

		await waitFor(() => actor.getSnapshot().matches('canceledSuccess'));
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
});
