import { test } from '@playwright/test';

export const isDonationWizardStripeE2eConfigured = () =>
	Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STORYBLOK_PREVIEW_TOKEN?.trim());

export const describeDonationWizardStripeE2e = isDonationWizardStripeE2eConfigured()
	? test.describe
	: test.describe.skip;
