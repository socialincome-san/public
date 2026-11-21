'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { PlanTile } from '@socialincome/design-system/forms/plan-tile/plan-tile';
import { useTranslations } from 'next-intl';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import { selectOneTimePlanView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { PlanBenefits } from './plan-benefits';
import { PlanTileImpact } from './plan-tile-impact';

export const OneTimePlanStep = ({ state, send }: DonationWizardStepProps) => {
	const t = useTranslations('donation-wizard');
	const { currency } = state.context;
	const view = selectOneTimePlanView(state.context);

	return (
		<div className={getDonationWizardCardClass('stepPlanOneTime')} data-testid="donation-wizard-step-one-time-plan">
			<div className="mb-6 grid grid-cols-2 gap-2.5 pt-0.5">
				<PlanTile
					label={t('stepAmount.one-time')}
					amount={`${currency} ${view.oneTimeAmount}`}
					footer={<PlanTileImpact {...view.oneTimeImpact} />}
					selected={view.oneTimePlanChoice === 'one-time'}
					onSelect={() => send({ type: 'SET_ONE_TIME_PLAN_CHOICE', value: 'one-time' })}
					testId="donation-wizard-plan-tier-1x"
				/>
				<PlanTile
					label={t('stepAmount.monthly')}
					amount={`${currency} ${view.monthlyUpsellAmount}`}
					caption={t('calculator.per-month')}
					footer={<strong>{t('stepPlan.upsell-preferred')}</strong>}
					selected={view.oneTimePlanChoice === 'monthly-half'}
					onSelect={() => send({ type: 'SET_ONE_TIME_PLAN_CHOICE', value: 'monthly-half' })}
					testId="donation-wizard-plan-tier-2x"
				/>
			</div>

			<div className="flex flex-col gap-6">
				<Button
					type="button"
					fullWidth
					data-testid="donation-wizard-continue"
					onClick={() => send({ type: 'PROCEED_TO_PAYMENT' })}
				>
					{t('stepPlan.choose-payment')}
				</Button>
				<PlanBenefits context={state.context} cancelable={view.oneTimePlanChoice === 'monthly-half'} />
			</div>
		</div>
	);
};
