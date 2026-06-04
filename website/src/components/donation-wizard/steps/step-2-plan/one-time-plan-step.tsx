'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { DonationStepFooter } from '../../shared/donation-step-footer';
import { getMonthlyUpsellAmount, resolveAmount } from '../../utils/donation-amount';
import { donationStepCardClass } from '../../utils/donation-wizard-layout';
import type { DonationWizardStepProps } from '../../wizard/types';
import { PlanStepHeader } from './plan-step-header';
import { PlanTierCard } from './plan-tier-card';

export const OneTimePlanStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { oneTimeCheckoutChoice } = state.context;
	const oneTimeAmount = resolveAmount(state.context) ?? 0;
	const monthlyUpsellAmount = getMonthlyUpsellAmount(oneTimeAmount);

	return (
		<div className={donationStepCardClass}>
			<PlanStepHeader titleKey="step2.one-time-title" cadence="one-time" send={send} />

			<div className="mb-5 flex flex-col gap-3">
				<PlanTierCard
					amount={oneTimeAmount}
					currency={currency}
					selected={oneTimeCheckoutChoice === 'one-time'}
					onSelect={() => send({ type: 'SET_ONE_TIME_CHECKOUT_CHOICE', value: 'one-time' })}
					benefits={[{ id: 'once', label: t('step2.one-time-option-hint') }]}
				/>
				<PlanTierCard
					amount={monthlyUpsellAmount}
					currency={currency}
					perMonthLabel={t('step2.per-month')}
					planLabel={t('step2.upsell-preferred')}
					badgeVariant="preferred"
					selected={oneTimeCheckoutChoice === 'monthly-half'}
					onSelect={() => send({ type: 'SET_ONE_TIME_CHECKOUT_CHOICE', value: 'monthly-half' })}
					benefits={[
						{ id: 'help', label: t('step2.upsell-subtitle') },
						{ id: 'cancel', label: t('step2.upsell-benefit-cancel') },
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
