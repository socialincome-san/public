import {
	getBeneficiaryImpact,
	getDonationBaseAmount,
	getDonationDisplayAmount,
	getMonthlyPlanBaseAmount,
	getMonthlyUpsellAmount,
	getOnePercentAmount,
	getOnlineTransactionCost,
	getTierAmounts,
	isAmountValid,
	isOnePercentPlanSelected,
	resolveAmount,
	type Cadence,
	type DonationAmountContext,
	type PaymentMethod,
	type PresetAmount,
} from '../utils/donation-amount';
import { getDonationWizardLayout } from '../utils/donation-wizard-layout';
import type { DonationWizardContext } from './donation-wizard-context';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardSend, DonationWizardState } from './types';

export const selectStep1FormView = (context: DonationAmountContext) => ({
	monthlyIncome: context.monthlyIncome,
	selectedAmount: context.selectedAmount,
	customAmount: context.customAmount,
	cadence: context.cadence,
	onePercent: getOnePercentAmount(context.monthlyIncome),
	onePercentSelected: isOnePercentPlanSelected(context),
	resolvedAmount: resolveAmount(context),
	isValid: isAmountValid(context),
});

export const createStep1Actions = (send: DonationWizardSend) => ({
	selectOnePercent: () => send({ type: 'SELECT_ONE_PERCENT' }),
	setMonthlyIncome: (value: number | null) => send({ type: 'SET_MONTHLY_INCOME', value }),
	setPresetAmount: (value: PresetAmount | 'other') => send({ type: 'SET_PRESET_AMOUNT', value }),
	setCustomAmount: (value: number | null) => send({ type: 'SET_CUSTOM_AMOUNT', value }),
	setCadence: (value: Cadence) => send({ type: 'SET_CADENCE', value }),
});

export const selectMonthlyPlanView = (context: DonationWizardContext) => {
	const { tier1x, tier2x } = getTierAmounts(getMonthlyPlanBaseAmount(context));

	return {
		selectedTier: context.selectedTier,
		usesMonthlyIncomeAmount: context.selectedAmount === null,
		tier1x,
		tier2x,
		tier1Impact: getBeneficiaryImpact(tier1x),
		tier2Impact: getBeneficiaryImpact(tier2x),
	};
};

export const selectOneTimePlanView = (context: DonationWizardContext) => {
	const oneTimeAmount = resolveAmount(context) ?? 0;

	return {
		oneTimePlanChoice: context.oneTimePlanChoice,
		oneTimeAmount,
		monthlyUpsellAmount: getMonthlyUpsellAmount(oneTimeAmount),
		oneTimeImpact: getBeneficiaryImpact(oneTimeAmount),
	};
};

export const selectPaymentView = (context: DonationWizardContext) => {
	const paymentMethod = resolveWizardPaymentMethod(context.paymentMethod, context.currency);
	const effectiveContext: DonationWizardContext =
		paymentMethod === context.paymentMethod
			? context
			: {
					...context,
					paymentMethod,
					coverTransactionCosts: paymentMethod === 'online',
				};
	const baseAmount = getDonationBaseAmount(effectiveContext);
	const displayAmount = getDonationDisplayAmount(effectiveContext);

	return {
		paymentMethod,
		cadence: context.cadence,
		coverTransactionCosts: effectiveContext.coverTransactionCosts,
		transactionCost: getOnlineTransactionCost(baseAmount),
		showTransactionCostToggle: paymentMethod === 'online',
		continueLabelKey:
			paymentMethod === 'qr' ? ('stepPayment.generate-qr-code' as const) : ('stepPayment.pay-online' as const),
		summary: {
			amount: displayAmount,
			showPerMonth: context.cadence === 'monthly',
		},
	};
};

export const isWizardQrCurrencySupported = (currency: string): boolean =>
	currency.toUpperCase() === 'CHF' || currency.toUpperCase() === 'EUR';

const resolveWizardPaymentMethod = (paymentMethod: PaymentMethod, currency: string): PaymentMethod =>
	paymentMethod === 'qr' && !isWizardQrCurrencySupported(currency) ? 'online' : paymentMethod;

export const selectWizardShellView = (state: DonationWizardState) => {
	const activeStep = getActiveWizardStep(state);

	return {
		activeStep,
		cadence: state.context.cadence,
		communityStats: state.context.communityStats,
		...getDonationWizardLayout(activeStep),
	};
};
