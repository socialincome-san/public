import { ContributorReferralSource } from '@/generated/prisma/enums';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import Stripe from 'stripe';
import {
	deleteDonationWizardTestUser,
	expectCompleteOneTimeStripeDonation,
	expectContributorOnboardingCompleted,
	expectNoDonationWizardRecords,
	getContributorStripeCustomerId,
} from './utils/donation-wizard-db';
import {
	completeOneTimePlanStep,
	completeReferralStep,
	completeStripeOnboardingStep,
	completeStripePaymentMethodStep,
	openDonationWizardFromHero,
} from './utils/donation-wizard-flow';
import { completeStripeEmbeddedCheckout, syncStripeChargeWebhookForCustomer } from './utils/donation-wizard-stripe';

const MONTHLY_INCOME = 7500;
const ONE_TIME_DONATION_AMOUNT = 75;

const waitForStripeCharge = async (stripeCustomerId: string) => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

	await expect
		.poll(async () => {
			const charges = await stripe.charges.list({ customer: stripeCustomerId, limit: 1 });

			return charges.data.length;
		})
		.toBeGreaterThan(0);
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('one-time donation via hero form and Stripe creates records at the right steps', async ({ page }) => {
	const donor = {
		firstName: 'OneTime',
		lastName: 'StripeDonor',
		email: `donation-wizard.one-time-stripe.${Date.now()}@example.com`,
	};

	await deleteDonationWizardTestUser(donor.email);

	try {
		await openDonationWizardFromHero(page, MONTHLY_INCOME, { cadence: 'one-time' });
		await completeOneTimePlanStep(page);

		await expectNoDonationWizardRecords(donor.email);

		await completeStripePaymentMethodStep(page);
		await completeStripeEmbeddedCheckout(page, donor);

		await completeStripeOnboardingStep(page, donor, 'female');
		await expectContributorOnboardingCompleted(donor.email, { gender: 'female', country: 'CH' });

		await completeReferralStep(page, 'social_media');

		const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
		await waitForStripeCharge(stripeCustomerId);
		await syncStripeChargeWebhookForCustomer(stripeCustomerId);

		await expectCompleteOneTimeStripeDonation(donor, {
			amount: ONE_TIME_DONATION_AMOUNT,
			gender: 'female',
			country: 'CH',
			referral: ContributorReferralSource.social_media,
		});
	} finally {
		await deleteDonationWizardTestUser(donor.email);
	}
});
