'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { DonationStepFooter } from '../../shared/donation-step-footer';
import { donationStepCardClass } from '../../utils/donation-wizard-layout';
import {
	type PlanBenefitDescriptor,
	resolvePlanBenefit,
	selectOneTimePlanView,
} from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { PlanStepHeader } from './plan-step-header';
import { PlanTierCard } from './plan-tier-card/plan-tier-card';

export const OneTimePlanStep = ({ state, send }: DonationWizardStepProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const view = selectOneTimePlanView(state.context);
	const toBenefits = (descriptors: PlanBenefitDescriptor[]) =>
		descriptors.map((descriptor) => resolvePlanBenefit(descriptor, t, language));

	return (
		<div className={donationStepCardClass}>
			<PlanStepHeader titleKey="stepPlan.one-time-title" cadence="one-time" send={send} />

			<div className="mb-5 flex flex-col gap-3">
				<PlanTierCard
					amount={view.oneTimeAmount}
					currency={currency}
					selected={view.oneTimePlanChoice === 'one-time'}
					onSelect={() => send({ type: 'SET_ONE_TIME_PLAN_CHOICE', value: 'one-time' })}
					benefits={toBenefits(view.oneTimeBenefits)}
				/>
				<PlanTierCard
					amount={view.monthlyUpsellAmount}
					currency={currency}
					perMonthLabel={t('stepPlan.per-month')}
					planLabel={t('stepPlan.upsell-preferred')}
					badgeVariant="preferred"
					selected={view.oneTimePlanChoice === 'monthly-half'}
					onSelect={() => send({ type: 'SET_ONE_TIME_PLAN_CHOICE', value: 'monthly-half' })}
					benefits={toBenefits(view.upsellBenefits)}
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
