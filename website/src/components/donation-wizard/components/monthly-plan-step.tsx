'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { getCommunityBenefit } from '../community-stats';
import { donationStepCardClass, donationStepTitleRowClass } from '../donation-wizard-layout';
import {
	getBeneficiaryCount,
	getMonthlyPlanBaseAmount,
	getTierAmounts,
	isOnePercentPlanSelected,
} from '../wizard/donation-amount';
import type { DonationWizardWithCommunityProps } from '../wizard/types';
import { DonationStepFooter } from './donation-step-footer';
import { PlanTierCard } from './plan-tier-card';
import { Step2CadenceSwitch } from './step2-cadence-switch';

export const MonthlyPlanStep = ({ state, send, communityStats }: DonationWizardWithCommunityProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { selectedTier } = state.context;
	const showPlanBadges = isOnePercentPlanSelected(state.context);
	const baseAmount = getMonthlyPlanBaseAmount(state.context);
	const { tier1x, tier2x } = getTierAmounts(baseAmount);
	const communityBenefit = getCommunityBenefit(t, language, communityStats);

	return (
		<div className={donationStepCardClass}>
			<div className={donationStepTitleRowClass}>
				<h3 className="text-foreground min-w-0 text-base font-medium sm:text-lg">{t('step2.monthly-title')}</h3>
				<Step2CadenceSwitch currentCadence="monthly" send={send} />
			</div>

			<div className="mb-5 flex flex-col gap-3">
				<PlanTierCard
					amount={tier1x}
					currency={currency}
					perMonthLabel={t('step2.per-month')}
					planLabel={showPlanBadges ? t('step2.plan-1x') : undefined}
					heartCount={1}
					selected={selectedTier === '1x'}
					onSelect={() => send({ type: 'SET_TIER', value: '1x' })}
					benefits={[
						{
							id: 'beneficiaries',
							label: t('step2.benefit-beneficiaries', { count: getBeneficiaryCount(tier1x) }),
						},
						{ id: 'fees', label: t('step2.benefit-fees') },
						...(communityBenefit ? [communityBenefit] : []),
					]}
				/>
				<PlanTierCard
					amount={tier2x}
					currency={currency}
					perMonthLabel={t('step2.per-month')}
					planLabel={showPlanBadges ? t('step2.plan-2x') : undefined}
					heartCount={2}
					selected={selectedTier === '2x'}
					onSelect={() => send({ type: 'SET_TIER', value: '2x' })}
					benefits={[
						{ id: 'double', label: t('step2.benefit-double-impact') },
						{
							id: 'beneficiaries',
							label: t('step2.benefit-beneficiaries', { count: getBeneficiaryCount(tier2x) }),
						},
					]}
				/>
			</div>

			<DonationStepFooter
				onBack={() => send({ type: 'BACK' })}
				onContinue={() => send({ type: 'PROCEED_TO_PAYMENT' })}
				continueLabel={t('step2.choose-payment')}
			/>
		</div>
	);
};
