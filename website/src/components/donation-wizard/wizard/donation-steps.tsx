'use client';

import { DonationFormStep } from '../steps/step-1-amount/donation-form-step';
import { MonthlyPlanStep } from '../steps/step-2-plan/monthly-plan-step';
import { OneTimePlanStep } from '../steps/step-2-plan/one-time-plan-step';
import { PaymentMethodStep } from '../steps/step-3-payment/payment-method-step';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardStepProps } from './types';

export const DonationSteps = ({ state, send }: DonationWizardStepProps) => {
	const activeStep = getActiveWizardStep(state);

	if (activeStep === 'step1') {
		return <DonationFormStep state={state} send={send} />;
	}

	if (activeStep === 'step2Monthly') {
		return <MonthlyPlanStep state={state} send={send} />;
	}

	if (activeStep === 'step2OneTime') {
		return <OneTimePlanStep state={state} send={send} />;
	}

	if (activeStep === 'step3Payment') {
		return <PaymentMethodStep state={state} send={send} />;
	}

	return null;
};
