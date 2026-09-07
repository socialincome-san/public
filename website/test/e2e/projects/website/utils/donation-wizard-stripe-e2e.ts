import { test } from '@playwright/test';

type DescribeFn = (title: string, callback: () => void) => void;

const isDonationWizardStripeE2eConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY?.trim());

export const describeDonationWizardStripeE2e: DescribeFn = isDonationWizardStripeE2eConfigured()
	? (title, callback) => test.describe(title, callback)
	: (title, callback) => test.describe.skip(title, callback);
