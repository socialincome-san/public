import { ContributorReferralSource } from '@/generated/prisma/enums';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import Stripe from 'stripe';
import {
	deleteDonationWizardTestUser,
	expectContributionOnCampaign,
	expectContributorOnboardingCompleted,
	expectNoDonationWizardRecords,
	expectOneTimeStripeWizardCompleted,
	getContributorStripeCustomerId,
} from './utils/donation-wizard-db';
import {
	completeOneTimePlanStep,
	completeReferralStep,
	completeStripeOnboardingStep,
	completeStripePaymentMethodStep,
	openDonationWizardFromProgramPage,
} from './utils/donation-wizard-flow';
import { completeStripeEmbeddedCheckout } from './utils/donation-wizard-stripe';

const MONTHLY_INCOME = 7500;
const PROGRAM_SLUG = 'skills-program';
const EXPECTED_CAMPAIGN_ID = 'campaign-si-education-sl-default';

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

test('one-time donation from program page lands on the program default campaign', async ({ page }) => {
	const donor = {
		firstName: 'Program',
		lastName: 'CampaignDonor',
		email: `donation-wizard.program-campaign.${Date.now()}@example.com`,
	};

	await deleteDonationWizardTestUser(donor.email);

	try {
		await openDonationWizardFromProgramPage(page, PROGRAM_SLUG, MONTHLY_INCOME, { cadence: 'one-time' });
		await completeOneTimePlanStep(page);

		await expectNoDonationWizardRecords(donor.email);

		await completeStripePaymentMethodStep(page);
		await completeStripeEmbeddedCheckout(page, donor);

		await completeStripeOnboardingStep(page, donor, 'female');
		await expectContributorOnboardingCompleted(donor.email, { gender: 'female', country: 'CH' });

		await completeReferralStep(page, 'social_media');

		const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
		await waitForStripeCharge(stripeCustomerId);

		await expectOneTimeStripeWizardCompleted(donor, {
			gender: 'female',
			country: 'CH',
			referral: ContributorReferralSource.social_media,
		});

		await expectContributionOnCampaign(donor.email, EXPECTED_CAMPAIGN_ID);
	} finally {
		await deleteDonationWizardTestUser(donor.email);
	}
});
