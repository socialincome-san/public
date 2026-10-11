import { test } from '@playwright/test';

type DescribeFn = (title: string, callback: () => void) => void;

const isDonationWizardStripeE2eConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY?.trim());

export const describeDonationWizardStripeE2e: DescribeFn = isDonationWizardStripeE2eConfigured()
	? (title, callback) =>
			test.describe(title, () => {
				// The default 30s test timeout would cut off the 90s Stripe checkout waits
				test.slow();
				callback();
			})
	: (title, callback) => test.describe.skip(title, callback);
