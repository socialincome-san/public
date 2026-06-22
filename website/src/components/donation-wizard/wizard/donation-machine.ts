import { getContributorCommunityStatsAction } from '@/lib/server-actions/contributor-public-actions';
import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { assign, fromPromise, setup } from 'xstate';
import { buildCompletedDonationSummary } from '../steps/step-stripe-checkout/map-wizard-to-stripe-checkout';
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
import {
	type DonationWizardContext,
	type QrDonorContext,
	getInitialWizardContext,
	resetQrBillContext,
	resetStripeCheckoutContext,
} from './donation-wizard-context';

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
			| { type: 'START_QR_FLOW' }
			| { type: 'QR_CONTACT_SUBMIT'; donor: Omit<QrDonorContext, 'language'>; language: string }
			| { type: 'QR_BILL_READY'; contributorReferenceId: string; contributionReferenceId: string; qrBillSvg: string }
			| { type: 'QR_BILL_ERROR'; message: string }
			| { type: 'QR_PAYMENT_CONFIRMED' }
			| { type: 'START_STRIPE_CHECKOUT' }
			| { type: 'STRIPE_CHECKOUT_READY'; clientSecret: string; sessionId: string; publishableKey: string }
			| { type: 'STRIPE_CHECKOUT_ERROR'; message: string }
			| { type: 'STRIPE_CHECKOUT_RETRY' }
			| { type: 'STRIPE_CHECKOUT_BACK' }
			| { type: 'STRIPE_CHECKOUT_COMPLETE' }
			| { type: 'DONATION_ONBOARDING_PERSONAL_COMPLETE' }
			| { type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' }
			| { type: 'DONATION_ONBOARDING_REFERRAL_COMPLETE' }
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
		pendingStepIsMonthlyPlan: ({ context }) => context.pendingStep === 'stepPlanMonthly',
		pendingStepIsOneTimePlan: ({ context }) => context.pendingStep === 'stepPlanOneTime',
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
						pendingStep: 'stepAmount' as const,
					})),
				},
				OPEN_FROM_FORM: [
					{
						guard: 'fromFormMonthly',
						target: 'loadingCommunityStats',
						actions: assign(({ event }) => ({
							...wizardContextFromFormAmount(event.context),
							...monthlyPlanStepDefaults,
							pendingStep: 'stepPlanMonthly' as const,
						})),
					},
					{
						guard: 'fromFormOneTime',
						target: 'loadingCommunityStats',
						actions: assign(({ event }) => ({
							...wizardContextFromFormAmount(event.context),
							...oneTimePlanStepDefaults,
							pendingStep: 'stepPlanOneTime' as const,
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
						target: 'stepPlanMonthly',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
					{
						guard: 'pendingStepIsOneTimePlan',
						target: 'stepPlanOneTime',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
					{
						target: 'stepAmount',
						actions: assign({
							communityStats: ({ event }) => event.output,
							pendingStep: () => null,
						}),
					},
				],
				onError: [
					{
						guard: 'pendingStepIsMonthlyPlan',
						target: 'stepPlanMonthly',
						actions: 'assignFailedCommunityStats',
					},
					{
						guard: 'pendingStepIsOneTimePlan',
						target: 'stepPlanOneTime',
						actions: 'assignFailedCommunityStats',
					},
					{
						target: 'stepAmount',
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
		stepAmount: {
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
						target: 'stepPlanMonthly',
						actions: assign({
							selectedTier: () => '1x' as const,
							...monthlyPlanStepDefaults,
						}),
					},
					{
						guard: 'canSubmitOneTime',
						target: 'stepPlanOneTime',
						actions: assign(oneTimePlanStepDefaults),
					},
				],
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepPlanMonthly: {
			on: {
				SET_TIER: {
					actions: assign({
						selectedTier: ({ event }) => event.value,
					}),
				},
				SET_CADENCE: [
					{
						guard: 'isOneTimeCadence',
						target: 'stepPlanOneTime',
						actions: assign({
							cadence: () => 'one-time' as const,
							...oneTimePlanStepDefaults,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'stepPayment',
					actions: assign({
						paymentMethod: () => 'qr' as const,
						coverTransactionCosts: () => false,
						...monthlyPlanStepDefaults,
						...resetStripeCheckoutContext,
						...resetQrBillContext,
						wizardPaymentSource: null,
					}),
				},
				BACK: 'stepAmount',
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepPlanOneTime: {
			on: {
				SET_ONE_TIME_PLAN_CHOICE: {
					actions: assign({
						oneTimePlanChoice: ({ event }) => event.value,
					}),
				},
				SET_CADENCE: [
					{
						guard: 'isMonthlyCadence',
						target: 'stepPlanMonthly',
						actions: assign({
							cadence: () => 'monthly' as const,
							selectedTier: () => '1x' as const,
							...monthlyPlanStepDefaults,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'stepPayment',
					actions: assign(({ context }) => ({
						paymentMethod: 'qr' as const,
						coverTransactionCosts: false,
						...paymentContextForOneTimePlanChoice(context.oneTimePlanChoice),
						...resetStripeCheckoutContext,
						...resetQrBillContext,
						wizardPaymentSource: null,
					})),
				},
				BACK: 'stepAmount',
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepPayment: {
			on: {
				SET_PAYMENT_METHOD: {
					actions: assign(({ event, context }) => ({
						paymentMethod: event.value,
						coverTransactionCosts: event.value === 'qr' ? false : context.coverTransactionCosts,
						...resetStripeCheckoutContext,
						...(event.value === 'online' ? resetQrBillContext : {}),
					})),
				},
				SET_COVER_TRANSACTION_COSTS: {
					actions: assign({
						coverTransactionCosts: ({ event }) => event.value,
					}),
				},
				BACK: [
					{
						guard: 'returnsToOneTimePlanStep',
						target: 'stepPlanOneTime',
					},
					{
						guard: 'isMonthlyContext',
						target: 'stepPlanMonthly',
					},
					{
						target: 'stepPlanOneTime',
					},
				],
				START_STRIPE_CHECKOUT: {
					guard: 'isOnlinePayment',
					target: 'stepStripeCheckout',
					actions: assign({
						...resetStripeCheckoutContext,
						...resetQrBillContext,
						wizardPaymentSource: 'stripe',
						stripeCheckoutStatus: () => 'loading' as const,
					}),
				},
				START_QR_FLOW: {
					guard: ({ context }) => context.paymentMethod === 'qr',
					target: 'stepQrContact',
					actions: assign({
						...resetQrBillContext,
						...resetStripeCheckoutContext,
						wizardPaymentSource: 'qr',
					}),
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepQrContact: {
			on: {
				QR_CONTACT_SUBMIT: {
					actions: assign({
						qrDonor: ({ event }) => ({
							...event.donor,
							language: event.language,
						}),
						qrBillStatus: () => 'loading' as const,
						qrBillError: () => null,
					}),
				},
				QR_BILL_READY: {
					target: 'stepQrBill',
					actions: assign({
						qrContributorReferenceId: ({ event }) => event.contributorReferenceId,
						qrContributionReferenceId: ({ event }) => event.contributionReferenceId,
						qrBillSvg: ({ event }) => event.qrBillSvg,
						qrBillStatus: () => 'ready' as const,
						qrBillError: () => null,
					}),
				},
				QR_BILL_ERROR: {
					actions: assign({
						qrBillStatus: () => 'error' as const,
						qrBillError: ({ event }) => event.message,
					}),
				},
				BACK: {
					guard: ({ context }) => context.qrContributorReferenceId === null,
					target: 'stepPayment',
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepQrBill: {
			on: {
				QR_PAYMENT_CONFIRMED: {
					target: 'stepOnboardingPersonal',
					actions: assign(({ context }) => ({
						completedDonationSummary: buildCompletedDonationSummary(context),
						qrBillSvg: null,
					})),
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepStripeCheckout: {
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
					target: 'stepPayment',
					actions: assign(resetStripeCheckoutContext),
				},
				STRIPE_CHECKOUT_COMPLETE: {
					target: 'stepOnboardingPersonal',
					actions: assign(({ context }) => ({
						completedDonationSummary: buildCompletedDonationSummary(context),
						wizardPaymentSource: 'stripe',
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
		stepOnboardingPersonal: {
			on: {
				DONATION_ONBOARDING_PERSONAL_COMPLETE: {
					target: 'stepOnboardingReferral',
				},
				DONATION_ONBOARDING_SKIP_TO_THANK_YOU: {
					target: 'stepThankYou',
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepOnboardingReferral: {
			on: {
				DONATION_ONBOARDING_REFERRAL_COMPLETE: {
					target: 'stepThankYou',
				},
				DONATION_ONBOARDING_SKIP_TO_THANK_YOU: {
					target: 'stepThankYou',
				},
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
		stepThankYou: {
			on: {
				CLOSE: {
					target: 'closed',
					actions: 'resetContext',
				},
			},
		},
	},
});
