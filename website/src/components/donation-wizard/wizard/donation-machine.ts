import { getContributorCommunityStatsAction } from '@/lib/server-actions/contributor-public-actions';
import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { assign, fromPromise, setup } from 'xstate';
import { buildCompletedDonationSummary } from '../steps/step-4-stripe/map-wizard-to-stripe-checkout';
import {
	type Cadence,
	type DonationAmountContext,
	type OneTimePlanChoice,
	type PaymentMethod,
	type PlanTier,
	type PresetAmount,
	isAmountValid,
} from '../utils/donation-amount';
import {
	monthlyPlanStepDefaults,
	oneTimePlanStepDefaults,
	paymentContextForOneTimePlanChoice,
	wizardContextFromFormAmount,
} from './donation-machine-logic';
import { type DonationWizardContext, getInitialWizardContext } from './donation-wizard-context';

const resetStripeCheckoutContext = {
	stripeCheckoutSessionId: null,
	stripeClientSecret: null,
	stripePublishableKey: null,
	stripeCheckoutStatus: 'idle' as const,
	stripeCheckoutError: null,
};

export const donationWizardMachine = setup({
	types: {} as {
		context: DonationWizardContext;
		events:
			| { type: 'OPEN' }
			| { type: 'OPEN_FROM_FORM'; context: DonationAmountContext }
			| { type: 'CLOSE' }
			| { type: 'SET_MONTHLY_INCOME'; value: number | null }
			| { type: 'SELECT_ONE_PERCENT' }
			| { type: 'SET_PRESET_AMOUNT'; value: PresetAmount | 'other' }
			| { type: 'SET_CUSTOM_AMOUNT'; value: number | null }
			| { type: 'SET_CADENCE'; value: Cadence }
			| { type: 'SET_ONE_TIME_PLAN_CHOICE'; value: OneTimePlanChoice }
			| { type: 'SET_TIER'; value: PlanTier }
			| { type: 'SET_PAYMENT_METHOD'; value: PaymentMethod }
			| { type: 'SET_COVER_TRANSACTION_COSTS'; value: boolean }
			| { type: 'SUBMIT' }
			| { type: 'PROCEED_TO_PAYMENT' }
			| { type: 'COMPLETE' }
			| { type: 'START_STRIPE_CHECKOUT' }
			| { type: 'STRIPE_CHECKOUT_READY'; clientSecret: string; sessionId: string; publishableKey: string }
			| { type: 'STRIPE_CHECKOUT_ERROR'; message: string }
			| { type: 'STRIPE_CHECKOUT_RETRY' }
			| { type: 'STRIPE_CHECKOUT_BACK' }
			| { type: 'STRIPE_CHECKOUT_COMPLETE' }
			| { type: 'DONATION_ONBOARDING_COMPLETE' }
			| { type: 'BACK' };
	},
	actors: {
		loadCommunityStats: fromPromise(async (): Promise<ContributorCommunityStats | null> => {
			const result = await getContributorCommunityStatsAction();

			return result.success ? result.data : null;
		}),
	},
	guards: {
		canSubmitMonthly: ({ context }) => isAmountValid(context) && context.cadence === 'monthly',
		canSubmitOneTime: ({ context }) => isAmountValid(context) && context.cadence === 'one-time',
		fromFormMonthly: ({ event }) =>
			event.type === 'OPEN_FROM_FORM' && isAmountValid(event.context) && event.context.cadence === 'monthly',
		fromFormOneTime: ({ event }) =>
			event.type === 'OPEN_FROM_FORM' && isAmountValid(event.context) && event.context.cadence === 'one-time',
		isMonthlyCadence: ({ event }) => event.type === 'SET_CADENCE' && event.value === 'monthly',
		isOneTimeCadence: ({ event }) => event.type === 'SET_CADENCE' && event.value === 'one-time',
		isMonthlyContext: ({ context }) => context.cadence === 'monthly',
		isOnlinePayment: ({ context }) => context.paymentMethod === 'online',
		returnsToOneTimePlanStep: ({ context }) => context.returnsToOneTimePlanStep,
		pendingStepIsMonthlyPlan: ({ context }) => context.pendingStep === 'step2Monthly',
		pendingStepIsOneTimePlan: ({ context }) => context.pendingStep === 'step2OneTime',
	},
	actions: {
		resetContext: assign(() => getInitialWizardContext()),
		assignFailedCommunityStats: assign({
			communityStats: () => null,
			pendingStep: () => null,
		}),
	},
}).createMachine({
	id: 'donationWizard',
	initial: 'closed',
	context: getInitialWizardContext(),
	states: {
		closed: {
			on: {
				OPEN: {
					target: 'loadingCommunityStats',
					actions: assign(() => ({
						...getInitialWizardContext(),
						pendingStep: 'step1' as const,
					})),
				},
				OPEN_FROM_FORM: [
					{
						guard: 'fromFormMonthly',
						target: 'loadingCommunityStats',
						actions: assign(({ event }) => ({
							...wizardContextFromFormAmount(event.context),
							...monthlyPlanStepDefaults,
							pendingStep: 'step2Monthly' as const,
						})),
					},
					{
						guard: 'fromFormOneTime',
						target: 'loadingCommunityStats',
						actions: assign(({ event }) => ({
							...wizardContextFromFormAmount(event.context),
							...oneTimePlanStepDefaults,
							pendingStep: 'step2OneTime' as const,
						})),
					},
				],
			},
		},
		loadingCommunityStats: {
			invoke: {
				src: 'loadCommunityStats',
				onDone: [
					{
						guard: 'pendingStepIsMonthlyPlan',
						target: 'step2Monthly',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
					{
						guard: 'pendingStepIsOneTimePlan',
						target: 'step2OneTime',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
					{
						target: 'step1',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
				],
				onError: [
					{
						guard: 'pendingStepIsMonthlyPlan',
						target: 'step2Monthly',
						actions: 'assignFailedCommunityStats',
					},
					{
						guard: 'pendingStepIsOneTimePlan',
						target: 'step2OneTime',
						actions: 'assignFailedCommunityStats',
					},
					{
						target: 'step1',
						actions: 'assignFailedCommunityStats',
					},
				],
			},
			on: {
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step1: {
			on: {
				SET_MONTHLY_INCOME: {
					actions: assign({
						monthlyIncome: ({ event }) => event.value,
						selectedAmount: () => null,
						customAmount: () => null,
					}),
				},
				SELECT_ONE_PERCENT: {
					actions: assign({
						selectedAmount: () => null,
						customAmount: () => null,
					}),
				},
				SET_PRESET_AMOUNT: {
					actions: assign({
						selectedAmount: ({ event }) => event.value,
						customAmount: () => null,
					}),
				},
				SET_CUSTOM_AMOUNT: {
					actions: assign({
						customAmount: ({ event }) => event.value,
						selectedAmount: () => 'other' as const,
					}),
				},
				SET_CADENCE: {
					actions: assign({
						cadence: ({ event }) => event.value,
					}),
				},
				SUBMIT: [
					{
						guard: 'canSubmitMonthly',
						target: 'step2Monthly',
						actions: assign({
							selectedTier: () => '1x' as const,
							...monthlyPlanStepDefaults,
						}),
					},
					{
						guard: 'canSubmitOneTime',
						target: 'step2OneTime',
						actions: assign(oneTimePlanStepDefaults),
					},
				],
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step2Monthly: {
			on: {
				SET_TIER: {
					actions: assign({
						selectedTier: ({ event }) => event.value,
					}),
				},
				SET_CADENCE: [
					{
						guard: 'isOneTimeCadence',
						target: 'step2OneTime',
						actions: assign({
							cadence: () => 'one-time' as const,
							...oneTimePlanStepDefaults,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'step3Payment',
					actions: assign({
						paymentMethod: () => 'qr' as const,
						coverTransactionCosts: () => false,
						...monthlyPlanStepDefaults,
						...resetStripeCheckoutContext,
					}),
				},
				BACK: 'step1',
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step2OneTime: {
			on: {
				SET_ONE_TIME_PLAN_CHOICE: {
					actions: assign({
						oneTimePlanChoice: ({ event }) => event.value,
					}),
				},
				SET_CADENCE: [
					{
						guard: 'isMonthlyCadence',
						target: 'step2Monthly',
						actions: assign({
							cadence: () => 'monthly' as const,
							selectedTier: () => '1x' as const,
							...monthlyPlanStepDefaults,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'step3Payment',
					actions: assign(({ context }) => ({
						paymentMethod: 'qr' as const,
						coverTransactionCosts: false,
						...paymentContextForOneTimePlanChoice(context.oneTimePlanChoice),
						...resetStripeCheckoutContext,
					})),
				},
				BACK: 'step1',
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step3Payment: {
			on: {
				SET_PAYMENT_METHOD: {
					actions: assign({
						paymentMethod: ({ event }) => event.value,
						coverTransactionCosts: ({ event, context }) => (event.value === 'qr' ? false : context.coverTransactionCosts),
						...resetStripeCheckoutContext,
					}),
				},
				SET_COVER_TRANSACTION_COSTS: {
					actions: assign({
						coverTransactionCosts: ({ event }) => event.value,
					}),
				},
				BACK: [
					{
						guard: 'returnsToOneTimePlanStep',
						target: 'step2OneTime',
					},
					{
						guard: 'isMonthlyContext',
						target: 'step2Monthly',
					},
					{
						target: 'step2OneTime',
					},
				],
				START_STRIPE_CHECKOUT: {
					guard: 'isOnlinePayment',
					target: 'step4StripeCheckout',
					actions: assign({
						...resetStripeCheckoutContext,
						stripeCheckoutStatus: () => 'loading' as const,
					}),
				},
				COMPLETE: {
					target: 'step6ThankYou',
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step4StripeCheckout: {
			on: {
				STRIPE_CHECKOUT_READY: {
					actions: assign({
						stripeClientSecret: ({ event }) => event.clientSecret,
						stripeCheckoutSessionId: ({ event }) => event.sessionId,
						stripePublishableKey: ({ event }) => event.publishableKey,
						stripeCheckoutStatus: () => 'ready' as const,
						stripeCheckoutError: () => null,
					}),
				},
				STRIPE_CHECKOUT_ERROR: {
					actions: assign({
						stripeCheckoutStatus: () => 'error' as const,
						stripeCheckoutError: ({ event }) => event.message,
						stripeClientSecret: () => null,
						stripePublishableKey: () => null,
					}),
				},
				STRIPE_CHECKOUT_RETRY: {
					actions: assign({
						stripeCheckoutStatus: () => 'loading' as const,
						stripeCheckoutError: () => null,
						stripeClientSecret: () => null,
						stripeCheckoutSessionId: () => null,
						stripePublishableKey: () => null,
					}),
				},
				STRIPE_CHECKOUT_BACK: {
					target: 'step3Payment',
					actions: assign(resetStripeCheckoutContext),
				},
				STRIPE_CHECKOUT_COMPLETE: {
					target: 'step5Onboarding',
					actions: assign(({ context }) => ({
						completedDonationSummary: buildCompletedDonationSummary(context),
						stripeClientSecret: null,
						stripePublishableKey: null,
						stripeCheckoutStatus: 'idle' as const,
					})),
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step5Onboarding: {
			on: {
				DONATION_ONBOARDING_COMPLETE: {
					target: 'step6ThankYou',
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		step6ThankYou: {
			on: {
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
	},
});
