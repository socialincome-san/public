import type { LanguageCode } from '@/lib/types/language';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import type { PlanTierBenefit } from '../steps/step-plan/plan-tier-card/plan-tier-benefit';
import {
	getBeneficiaryCount,
	getDonationBaseAmount,
	getDonationDisplayAmount,
	getMonthlyPlanBaseAmount,
	getMonthlyUpsellAmount,
	getOnePercentAmount,
	getOnlineTransactionCostChf,
	getTierAmounts,
	isAmountValid,
	isOnePercentPlanSelected,
	resolveAmount,
	type Cadence,
	type DonationAmountContext,
	type PresetAmount,
} from '../utils/donation-amount';
import type { DonationWizardContext } from './donation-wizard-context';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardSend, DonationWizardState } from './types';

const localeForLanguage = (language: LanguageCode): string => (language === 'de' ? 'de-CH' : language);

const formatCommunityCount = (value: number, language: LanguageCode): string =>
	formatNumberLocale(value, localeForLanguage(language));

type Translate = (key: string, context?: Record<string, unknown>) => string;

export type PlanBenefitDescriptor =
	| { id: string; type: 'beneficiaries'; count: number }
	| { id: string; type: 'fees' }
	| { id: string; type: 'double-impact' }
	| { id: string; type: 'community'; supporterCount: number }
	| { id: string; type: 'one-time-hint' }
	| { id: string; type: 'upsell-subtitle' }
	| { id: string; type: 'upsell-cancel' };

export const resolvePlanBenefit = (
	descriptor: PlanBenefitDescriptor,
	t: Translate,
	language: LanguageCode,
): PlanTierBenefit => {
	switch (descriptor.type) {
		case 'beneficiaries':
			return { id: descriptor.id, label: t('stepPlan.benefit-beneficiaries', { count: descriptor.count }) };
		case 'fees':
			return { id: descriptor.id, label: t('stepPlan.benefit-fees') };
		case 'double-impact':
			return { id: descriptor.id, label: t('stepPlan.benefit-double-impact') };
		case 'community':
			return {
				id: descriptor.id,
				label: t('stepPlan.benefit-community', {
					count: formatCommunityCount(descriptor.supporterCount, language),
				}),
				icon: 'heart',
				emphasis: true,
			};
		case 'one-time-hint':
			return { id: descriptor.id, label: t('stepPlan.one-time-option-hint') };
		case 'upsell-subtitle':
			return { id: descriptor.id, label: t('stepPlan.upsell-subtitle') };
		case 'upsell-cancel':
			return { id: descriptor.id, label: t('stepPlan.upsell-benefit-cancel') };
	}
};

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
	const baseAmount = getMonthlyPlanBaseAmount(context);
	const { tier1x, tier2x } = getTierAmounts(baseAmount);
	const supporterCount = context.communityStats?.supporterCount ?? 0;
	const communityBenefit: PlanBenefitDescriptor[] =
		supporterCount > 0 ? [{ id: 'community', type: 'community', supporterCount }] : [];

	return {
		selectedTier: context.selectedTier,
		showPlanBadges: isOnePercentPlanSelected(context),
		tier1x,
		tier2x,
		tier1Benefits: [
			{ id: 'beneficiaries', type: 'beneficiaries' as const, count: getBeneficiaryCount(tier1x) },
			{ id: 'fees', type: 'fees' as const },
			...communityBenefit,
		],
		tier2Benefits: [
			{ id: 'double', type: 'double-impact' as const },
			{ id: 'beneficiaries', type: 'beneficiaries' as const, count: getBeneficiaryCount(tier2x) },
		],
	};
};

export const selectOneTimePlanView = (context: DonationWizardContext) => {
	const oneTimeAmount = resolveAmount(context) ?? 0;

	return {
		oneTimePlanChoice: context.oneTimePlanChoice,
		oneTimeAmount,
		monthlyUpsellAmount: getMonthlyUpsellAmount(oneTimeAmount),
		oneTimeBenefits: [{ id: 'once', type: 'one-time-hint' as const }],
		upsellBenefits: [
			{ id: 'help', type: 'upsell-subtitle' as const },
			{ id: 'cancel', type: 'upsell-cancel' as const },
		],
	};
};

export const selectPaymentView = (context: DonationWizardContext) => {
	const baseAmount = getDonationBaseAmount(context);
	const displayAmount = getDonationDisplayAmount(context);

	return {
		paymentMethod: context.paymentMethod,
		cadence: context.cadence,
		coverTransactionCosts: context.coverTransactionCosts,
		transactionCost: getOnlineTransactionCostChf(baseAmount),
		showTransactionCostToggle: context.paymentMethod === 'online',
		continueLabelKey:
			context.paymentMethod === 'qr' ? ('stepPayment.generate-qr-code' as const) : ('stepPayment.pay-online' as const),
		summary: {
			amount: displayAmount,
			showPerMonth: context.cadence === 'monthly',
		},
	};
};

export const selectCadenceSwitchView = (currentCadence: Cadence) => ({
	targetCadence: currentCadence === 'monthly' ? ('one-time' as const) : ('monthly' as const),
	labelKey:
		currentCadence === 'monthly' ? ('stepPlan.switch-to-one-time' as const) : ('stepPlan.switch-to-monthly' as const),
});

export const selectWizardShellView = (state: DonationWizardState) => {
	const activeStep = getActiveWizardStep(state);

	const showImpactPanel =
		activeStep === 'stepAmount' || activeStep === 'stepPlanMonthly' || activeStep === 'stepPlanOneTime';
	const showQrContactHintsPanel = activeStep === 'stepQrContact';

	return {
		activeStep,
		isPaymentStep:
			activeStep === 'stepPayment' ||
			activeStep === 'stepStripeCheckout' ||
			activeStep === 'stepQrContact' ||
			activeStep === 'stepQrBill',
		showImpactPanel,
		showQrContactHintsPanel,
		usesSplitLayout: showImpactPanel || showQrContactHintsPanel,
		communityStats: state.context.communityStats,
	};
};
