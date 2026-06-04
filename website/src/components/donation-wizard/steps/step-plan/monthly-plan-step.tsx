'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { DonationStepFooter } from '../../shared/donation-step-footer';
import { donationStepCardClass } from '../../utils/donation-wizard-layout';
import {
	type PlanBenefitDescriptor,
	resolvePlanBenefit,
	selectMonthlyPlanView,
} from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { PlanStepHeader } from './plan-step-header';
import { PlanTierCard } from './plan-tier-card/plan-tier-card';

export const MonthlyPlanStep = ({ state, send }: DonationWizardStepProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const view = selectMonthlyPlanView(state.context);
	const toBenefits = (descriptors: PlanBenefitDescriptor[]) =>
		descriptors.map((descriptor) => resolvePlanBenefit(descriptor, t, language));

	return (
		<div className={donationStepCardClass}>
			<PlanStepHeader titleKey="stepPlan.monthly-title" cadence="monthly" send={send} />

			<div className="mb-5 flex flex-col gap-3">
				<PlanTierCard
					amount={view.tier1x}
					currency={currency}
					perMonthLabel={t('stepPlan.per-month')}
					planLabel={view.showPlanBadges ? t('stepPlan.plan-1x') : undefined}
					heartCount={1}
					selected={view.selectedTier === '1x'}
					onSelect={() => send({ type: 'SET_TIER', value: '1x' })}
					benefits={toBenefits(view.tier1Benefits)}
				/>
				<PlanTierCard
					amount={view.tier2x}
					currency={currency}
					perMonthLabel={t('stepPlan.per-month')}
					planLabel={view.showPlanBadges ? t('stepPlan.plan-2x') : undefined}
					heartCount={2}
					selected={view.selectedTier === '2x'}
					onSelect={() => send({ type: 'SET_TIER', value: '2x' })}
					benefits={toBenefits(view.tier2Benefits)}
				/>
			</div>

			<DonationStepFooter
				onBack={() => send({ type: 'BACK' })}
				onContinue={() => send({ type: 'PROCEED_TO_PAYMENT' })}
				continueLabel={t('stepPlan.choose-payment')}
			/>
		</div>
	);
};
