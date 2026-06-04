'use client';

import { DonationFormStep } from '../steps/step-1-amount/donation-form-step';
import { MonthlyPlanStep } from '../steps/step-2-plan/monthly-plan-step';
import { OneTimePlanStep } from '../steps/step-2-plan/one-time-plan-step';
import { PaymentMethodStep } from '../steps/step-3-payment/payment-method-step';
import type { DonationWizardStepProps, DonationWizardWithCommunityProps } from './types';

type Props = DonationWizardStepProps & Pick<DonationWizardWithCommunityProps, 'communityStats'>;

export const DonationSteps = ({ state, send, communityStats }: Props) => {
	if (state.matches('step1')) {
		return <DonationFormStep state={state} send={send} />;
	}

	if (state.matches('step2Monthly')) {
		return <MonthlyPlanStep state={state} send={send} communityStats={communityStats} />;
	}

	if (state.matches('step2OneTime')) {
		return <OneTimePlanStep state={state} send={send} />;
	}

	if (state.matches('step3Payment')) {
		return <PaymentMethodStep state={state} send={send} />;
	}

	return null;
};
