'use client';

import { MonthlyPlanStep } from '../components/monthly-plan-step';
import { OneTimePlanStep } from '../components/one-time-plan-step';
import { PaymentMethodStep } from '../components/payment-method-step';
import { WizardDonationFormStep } from '../components/wizard-donation-form-step';
import type { DonationWizardStepProps, DonationWizardWithCommunityProps } from './types';

type Props = DonationWizardStepProps & Pick<DonationWizardWithCommunityProps, 'communityStats'>;

export const DonationSteps = ({ state, send, communityStats }: Props) => {
	if (state.matches('step1')) {
		return <WizardDonationFormStep state={state} send={send} />;
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
