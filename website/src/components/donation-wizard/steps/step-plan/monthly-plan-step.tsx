'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { PlanTile } from '@socialincome/design-system/forms/plan-tile/plan-tile';
import { useTranslations } from 'next-intl';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import { selectMonthlyPlanView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { PlanTileImpact, PlanTileImpactHint } from './plan-tile-impact';

export const MonthlyPlanStep = ({ state, send }: DonationWizardStepProps) => {
	const t = useTranslations('donation-wizard');
	const { currency } = state.context;
	const view = selectMonthlyPlanView(state.context);

	return (
		<div className={getDonationWizardCardClass('stepPlanMonthly')} data-testid="donation-wizard-step-monthly-plan">
			<div className="mb-4 grid flex-1 grid-cols-2 gap-2.5 pt-0.5">
				<PlanTile
					label={view.usesMonthlyIncomeAmount ? t('stepPlan.plan-1x') : t('stepPlan.your-amount')}
					amount={`${currency} ${view.tier1x}`}
					caption={t('calculator.per-month')}
					footer={<PlanTileImpact {...view.tier1Impact} />}
					footerAction={<PlanTileImpactHint />}
					selected={view.selectedTier === '1x'}
					onSelect={() => send({ type: 'SET_TIER', value: '1x' })}
					testId="donation-wizard-plan-tier-1x"
				/>
				<PlanTile
					label={view.usesMonthlyIncomeAmount ? t('stepPlan.plan-2x') : t('stepPlan.double-amount')}
					amount={`${currency} ${view.tier2x}`}
					caption={t('calculator.per-month')}
					highlight={t('stepPlan.double-impact-badge')}
					footer={<PlanTileImpact {...view.tier2Impact} />}
					footerAction={<PlanTileImpactHint />}
					selected={view.selectedTier === '2x'}
					onSelect={() => send({ type: 'SET_TIER', value: '2x' })}
					testId="donation-wizard-plan-tier-2x"
				/>
			</div>

			<div>
				<Button
					type="button"
					fullWidth
					data-testid="donation-wizard-continue"
					onClick={() => send({ type: 'PROCEED_TO_PAYMENT' })}
				>
					{t('stepPlan.choose-payment')}
				</Button>
			</div>
		</div>
	);
};
