'use client';

import { AmountStep } from '../steps/step-amount/amount-step';
import { ReferralStep } from '../steps/step-onboarding-referral/referral-step';
import { OnboardingStep } from '../steps/step-onboarding/onboarding-step';
import { PaymentMethodStep } from '../steps/step-payment/payment-method-step';
import { MonthlyPlanStep } from '../steps/step-plan/monthly-plan-step';
import { OneTimePlanStep } from '../steps/step-plan/one-time-plan-step';
import { QrBillStep } from '../steps/step-qr-bill/qr-bill-step';
import { QrContactStep } from '../steps/step-qr-contact/qr-contact-step';
import { StripeCheckoutStep } from '../steps/step-stripe-checkout/stripe-checkout-step';
import { ThankYouStep } from '../steps/step-thank-you/thank-you-step';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardStepProps } from './types';

export const DonationSteps = ({ state, send }: DonationWizardStepProps) => {
	const activeStep = getActiveWizardStep(state);

	if (activeStep === 'stepAmount') {
		return <AmountStep state={state} send={send} />;
	}

	if (activeStep === 'stepPlanMonthly') {
		return <MonthlyPlanStep state={state} send={send} />;
	}

	if (activeStep === 'stepPlanOneTime') {
		return <OneTimePlanStep state={state} send={send} />;
	}

	if (activeStep === 'stepPayment') {
		return <PaymentMethodStep state={state} send={send} />;
	}

	if (activeStep === 'stepQrContact') {
		return <QrContactStep state={state} send={send} />;
	}

	if (activeStep === 'stepQrBill') {
		return <QrBillStep state={state} send={send} />;
	}

	if (activeStep === 'stepStripeCheckout') {
		return <StripeCheckoutStep state={state} send={send} />;
	}

	if (activeStep === 'stepOnboardingPersonal') {
		return <OnboardingStep state={state} send={send} />;
	}

	if (activeStep === 'stepOnboardingReferral') {
		return <ReferralStep state={state} send={send} />;
	}

	if (activeStep === 'stepThankYou') {
		return <ThankYouStep />;
	}

	return null;
};
