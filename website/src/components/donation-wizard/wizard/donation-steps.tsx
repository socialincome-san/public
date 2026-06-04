'use client';

import { AmountStep } from '../steps/step-1-amount/amount-step';
import { MonthlyPlanStep } from '../steps/step-2-plan/monthly-plan-step';
import { OneTimePlanStep } from '../steps/step-2-plan/one-time-plan-step';
import { PaymentMethodStep } from '../steps/step-3-payment/payment-method-step';
import { StripeCheckoutStep } from '../steps/step-4-stripe/stripe-checkout-step';
import { OnboardingStep } from '../steps/step-5-onboarding/onboarding-step';
import { ThankYouStep } from '../steps/step-6-thank-you/thank-you-step';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardStepProps } from './types';

export const DonationSteps = ({ state, send }: DonationWizardStepProps) => {
	const activeStep = getActiveWizardStep(state);

	if (activeStep === 'step1') {
		return <AmountStep state={state} send={send} />;
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

	if (activeStep === 'step4StripeCheckout') {
		return <StripeCheckoutStep state={state} send={send} />;
	}

	if (activeStep === 'step5Onboarding') {
		return <OnboardingStep state={state} send={send} />;
	}

	if (activeStep === 'step6ThankYou') {
		return <ThankYouStep />;
	}

	return null;
};
