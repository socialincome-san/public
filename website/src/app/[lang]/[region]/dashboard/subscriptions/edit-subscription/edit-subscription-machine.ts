import { type Currency } from '@/generated/prisma/client';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { cancelSubscriptionAction, updateSubscriptionAmountAction } from '@/lib/server-actions/subscription-actions';
import {
	canUpdateSubscriptionAmount,
	clampSubscriptionAmount,
	isSubscriptionAmountInRange,
} from '@/lib/services/subscription/subscription-amount';
import { assign, fromPromise, setup } from 'xstate';

export type EditSubscriptionPaymentMethod = 'stripe' | 'bank_transfer';

export type EditSubscriptionOpenInput = {
	subscriptionId: string;
	initialAmount: number;
	currency: Currency;
	paymentMethod: EditSubscriptionPaymentMethod;
	brand?: string;
	last4?: string;
	coverTransactionCosts?: boolean;
	preselectCoverTransactionCosts?: boolean;
};

export const editSubscriptionMachine = setup({
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- XState uses this empty object to carry machine types.
	types: {} as {
		context: {
			subscriptionId: string | null;
			initialAmount: number;
			amount: number;
			currency: Currency;
			paymentMethod: EditSubscriptionPaymentMethod;
			brand?: string;
			last4?: string;
			initialCoverTransactionCosts: boolean;
			coverTransactionCosts: boolean;
			cancellationReason?: SubscriptionCancellationReason;
			error?: string;
		};
		events:
			| { type: 'OPEN'; subscription: EditSubscriptionOpenInput }
			| { type: 'SET_AMOUNT'; value: number }
			| { type: 'SET_COVER_TRANSACTION_COSTS'; value: boolean }
			| { type: 'SUBMIT' }
			| { type: 'START_CANCEL' }
			| { type: 'REDUCE_AMOUNT'; value: number | 'other' }
			| { type: 'CONTINUE_CANCEL' }
			| { type: 'SET_CANCEL_REASON'; value: SubscriptionCancellationReason }
			| { type: 'CONFIRM_CANCEL' }
			| { type: 'BACK' }
			| { type: 'DONE' }
			| { type: 'CLOSE' };
	},
	actors: {
		updateAmount: fromPromise(
			async ({ input }: { input: { subscriptionId: string; amount: number; coverTransactionCosts?: boolean } }) => {
				const result = await updateSubscriptionAmountAction(input.subscriptionId, input.amount, {
					coverTransactionCosts: input.coverTransactionCosts,
				});
				if (!result.success) {
					throw new Error(result.error);
				}

				return result.data;
			},
		),
		cancelSubscription: fromPromise(
			async ({ input }: { input: { subscriptionId: string; reason: SubscriptionCancellationReason } }) => {
				const result = await cancelSubscriptionAction(input.subscriptionId, input.reason);
				if (!result.success) {
					throw new Error(result.error);
				}
			},
		),
	},
	guards: {
		canSubmit: ({ context }) => {
			if (context.subscriptionId === null || !isSubscriptionAmountInRange(context.amount)) {
				return false;
			}

			const amountChanged = canUpdateSubscriptionAmount(context.amount, context.initialAmount);
			const coverChanged = context.coverTransactionCosts !== context.initialCoverTransactionCosts;

			return amountChanged || coverChanged;
		},
		hasCancelReason: ({ context }) => context.cancellationReason !== undefined,
	},
}).createMachine({
	id: 'editSubscription',
	initial: 'closed',
	context: {
		subscriptionId: null,
		initialAmount: 0,
		amount: 0,
		currency: 'CHF',
		paymentMethod: 'stripe',
		brand: undefined,
		last4: undefined,
		initialCoverTransactionCosts: false,
		coverTransactionCosts: false,
		cancellationReason: undefined,
		error: undefined,
	},
	states: {
		closed: {
			on: {
				OPEN: {
					target: 'editing',
					actions: assign(({ event }) => {
						const initialCoverTransactionCosts = event.subscription.coverTransactionCosts ?? false;

						return {
							subscriptionId: event.subscription.subscriptionId,
							initialAmount: event.subscription.initialAmount,
							amount: event.subscription.initialAmount,
							currency: event.subscription.currency,
							paymentMethod: event.subscription.paymentMethod,
							brand: event.subscription.brand,
							last4: event.subscription.last4,
							initialCoverTransactionCosts,
							coverTransactionCosts: event.subscription.preselectCoverTransactionCosts ?? initialCoverTransactionCosts,
							cancellationReason: undefined,
							error: undefined,
						};
					}),
				},
			},
		},
		editing: {
			on: {
				SET_AMOUNT: {
					actions: assign({
						amount: ({ event }) => event.value,
						error: () => undefined,
					}),
				},
				SET_COVER_TRANSACTION_COSTS: {
					actions: assign({
						coverTransactionCosts: ({ event }) => event.value,
						error: () => undefined,
					}),
				},
				SUBMIT: {
					guard: 'canSubmit',
					target: 'submitting',
				},
				START_CANCEL: {
					target: 'retention',
					actions: assign({
						cancellationReason: () => undefined,
						error: () => undefined,
					}),
				},
				CLOSE: 'closed',
			},
		},
		retention: {
			on: {
				REDUCE_AMOUNT: {
					target: 'editing',
					actions: assign({
						amount: ({ context, event }) =>
							event.value === 'other' ? context.amount : clampSubscriptionAmount(event.value),
						error: () => undefined,
					}),
				},
				CONTINUE_CANCEL: 'reason',
				BACK: 'editing',
				CLOSE: 'closed',
			},
		},
		reason: {
			on: {
				SET_CANCEL_REASON: {
					actions: assign({
						cancellationReason: ({ event }) => event.value,
						error: () => undefined,
					}),
				},
				CONFIRM_CANCEL: {
					guard: 'hasCancelReason',
					target: 'canceling',
				},
				BACK: 'retention',
				CLOSE: 'closed',
			},
		},
		submitting: {
			invoke: {
				src: 'updateAmount',
				input: ({ context }) => {
					if (!context.subscriptionId) {
						throw new Error('Missing subscription');
					}

					return {
						subscriptionId: context.subscriptionId,
						amount: context.amount,
						coverTransactionCosts: context.paymentMethod === 'stripe' ? context.coverTransactionCosts : undefined,
					};
				},
				onDone: {
					target: 'success',
					actions: assign({
						error: () => undefined,
						initialAmount: ({ context }) => context.amount,
						initialCoverTransactionCosts: ({ context }) => context.coverTransactionCosts,
					}),
				},
				onError: {
					target: 'editing',
					actions: assign({
						error: () => 'failed',
					}),
				},
			},
		},
		canceling: {
			invoke: {
				src: 'cancelSubscription',
				input: ({ context }) => {
					if (!context.subscriptionId || !context.cancellationReason) {
						throw new Error('Missing subscription or cancellation reason');
					}

					return {
						subscriptionId: context.subscriptionId,
						reason: context.cancellationReason,
					};
				},
				onDone: {
					target: 'canceledSuccess',
					actions: assign({
						error: () => undefined,
					}),
				},
				onError: {
					target: 'reason',
					actions: assign({
						error: () => 'failed',
					}),
				},
			},
		},
		success: {
			on: {
				DONE: 'closed',
				CLOSE: 'closed',
			},
		},
		canceledSuccess: {
			on: {
				DONE: 'closed',
				CLOSE: 'closed',
			},
		},
	},
});
