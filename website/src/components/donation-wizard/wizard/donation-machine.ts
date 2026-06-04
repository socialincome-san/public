import { assign, setup } from 'xstate';
import {
	type Cadence,
	type DonationAmountContext,
	type OneTimeCheckoutChoice,
	type PaymentMethod,
	type PlanTier,
	type PresetAmount,
	getInitialDonationContext,
	isAmountValid,
} from '../utils/donation-amount';

const prepareWizardContext = (context: DonationAmountContext): DonationAmountContext => ({
	...context,
	selectedTier: '1x',
	paymentMethod: 'qr',
	useHalfMonthlyAmount: false,
	coverTransactionCosts: false,
	oneTimeCheckoutChoice: 'one-time',
	checkoutFromOneTimeStep: false,
	campaignId: context.campaignId,
});

const enterStep2OneTime: Pick<
	DonationAmountContext,
	'oneTimeCheckoutChoice' | 'checkoutFromOneTimeStep' | 'useHalfMonthlyAmount'
> = {
	oneTimeCheckoutChoice: 'one-time',
	checkoutFromOneTimeStep: true,
	useHalfMonthlyAmount: false,
};

const enterStep2Monthly: Pick<DonationAmountContext, 'checkoutFromOneTimeStep' | 'useHalfMonthlyAmount'> = {
	checkoutFromOneTimeStep: false,
	useHalfMonthlyAmount: false,
};

const applyOneTimeCheckoutChoice = (choice: OneTimeCheckoutChoice) => {
	if (choice === 'monthly-half') {
		return {
			cadence: 'monthly' as const,
			useHalfMonthlyAmount: true,
			selectedTier: '1x' as const,
			checkoutFromOneTimeStep: true,
		};
	}

	return {
		cadence: 'one-time' as const,
		useHalfMonthlyAmount: false,
		checkoutFromOneTimeStep: true,
	};
};

export const donationWizardMachine = setup({
	types: {} as {
		context: DonationAmountContext;
		events:
			| { type: 'OPEN' }
			| { type: 'OPEN_FROM_FORM'; context: DonationAmountContext }
			| { type: 'CLOSE' }
			| { type: 'SET_MONTHLY_INCOME'; value: number }
			| { type: 'SELECT_ONE_PERCENT' }
			| { type: 'SET_PRESET_AMOUNT'; value: PresetAmount | 'other' }
			| { type: 'SET_CUSTOM_AMOUNT'; value: number | null }
			| { type: 'SET_CADENCE'; value: Cadence }
			| { type: 'SET_ONE_TIME_CHECKOUT_CHOICE'; value: OneTimeCheckoutChoice }
			| { type: 'SET_TIER'; value: PlanTier }
			| { type: 'SET_PAYMENT_METHOD'; value: PaymentMethod }
			| { type: 'SET_COVER_TRANSACTION_COSTS'; value: boolean }
			| { type: 'SUBMIT' }
			| { type: 'PROCEED_TO_PAYMENT' }
			| { type: 'COMPLETE' }
			| { type: 'BACK' };
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
		checkoutFromOneTimeStep: ({ context }) => context.checkoutFromOneTimeStep,
	},
	actions: {
		resetContext: assign(() => getInitialDonationContext()),
	},
}).createMachine({
	id: 'donationWizard',
	initial: 'closed',
	context: getInitialDonationContext(),
	states: {
		closed: {
			on: {
				OPEN: {
					target: 'step1',
					actions: 'resetContext',
				},
				OPEN_FROM_FORM: [
					{
						guard: 'fromFormMonthly',
						target: 'step2Monthly',
						actions: assign(({ event }) => ({
							...prepareWizardContext(event.context),
							...enterStep2Monthly,
						})),
					},
					{
						guard: 'fromFormOneTime',
						target: 'step2OneTime',
						actions: assign(({ event }) => ({
							...prepareWizardContext(event.context),
							...enterStep2OneTime,
						})),
					},
				],
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
							...enterStep2Monthly,
						}),
					},
					{
						guard: 'canSubmitOneTime',
						target: 'step2OneTime',
						actions: assign(enterStep2OneTime),
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
							...enterStep2OneTime,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'step3Payment',
					actions: assign({
						paymentMethod: () => 'qr' as const,
						coverTransactionCosts: () => false,
						...enterStep2Monthly,
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
				SET_ONE_TIME_CHECKOUT_CHOICE: {
					actions: assign({
						oneTimeCheckoutChoice: ({ event }) => event.value,
					}),
				},
				SET_CADENCE: [
					{
						guard: 'isMonthlyCadence',
						target: 'step2Monthly',
						actions: assign({
							cadence: () => 'monthly' as const,
							selectedTier: () => '1x' as const,
							...enterStep2Monthly,
						}),
					},
				],
				PROCEED_TO_PAYMENT: {
					target: 'step3Payment',
					actions: assign(({ context }) => ({
						paymentMethod: 'qr' as const,
						coverTransactionCosts: false,
						...applyOneTimeCheckoutChoice(context.oneTimeCheckoutChoice),
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
					}),
				},
				SET_COVER_TRANSACTION_COSTS: {
					actions: assign({
						coverTransactionCosts: ({ event }) => event.value,
					}),
				},
				BACK: [
					{
						guard: 'checkoutFromOneTimeStep',
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
				COMPLETE: {
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
