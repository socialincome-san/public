import { seedDatabase } from '@/lib/database/seed/run-seed';
import {
	amountToStripeUnitAmount,
	COVER_TRANSACTION_COSTS_METADATA_KEY,
	getAmountWithTransactionCostCoverage,
	toCoverTransactionCostsMetadataValue,
} from '@/lib/services/subscription/cover-transaction-costs';
import { expect, test, type Page } from '@playwright/test';
import Stripe from 'stripe';
import {
	deleteDonationWizardTestUser,
	expectContributorOnboardingCompleted,
	expectNoDonationWizardRecords,
	getContributorStripeCustomerId,
	type DonationWizardDonor,
} from './utils/donation-wizard-db';
import {
	completeMonthlyPlanStep,
	completeReferralStep,
	completeStripeOnboardingStep,
	completeStripePaymentMethodStep,
	openDonationWizardFromHero,
} from './utils/donation-wizard-flow';
import { completeStripeEmbeddedCheckout } from './utils/donation-wizard-stripe';
import { describeDonationWizardStripeE2e } from './utils/donation-wizard-stripe-e2e';

const MONTHLY_INCOME = 7500;
const MONTHLY_DONATION_BASE = 75;
const MONTHLY_DONATION_WITH_FEES = getAmountWithTransactionCostCoverage(MONTHLY_DONATION_BASE);

const getStripeClient = () => {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		throw new Error('STRIPE_SECRET_KEY is required for Stripe e2e assertions');
	}

	return new Stripe(stripeSecretKey);
};

const waitForStripeSubscription = async (
	stripeCustomerId: string,
	expected: { unitAmount: number; coverTransactionCosts: boolean },
) => {
	const stripe = getStripeClient();

	await expect
		.poll(async () => {
			const subscriptions = await stripe.subscriptions.list({
				customer: stripeCustomerId,
				limit: 1,
				status: 'all',
				expand: ['data.items.data.price'],
			});
			const subscription = subscriptions.data[0];
			if (!subscription) {
				return null;
			}

			const price = subscription.items.data[0]?.price;
			const unitAmount = typeof price === 'object' && price && 'unit_amount' in price ? price.unit_amount : null;

			return {
				unitAmount,
				coverTransactionCosts: subscription.metadata[COVER_TRANSACTION_COSTS_METADATA_KEY] ?? null,
			};
		})
		.toEqual({
			unitAmount: expected.unitAmount,
			coverTransactionCosts: toCoverTransactionCostsMetadataValue(expected.coverTransactionCosts),
		});
};

const completeMonthlyStripeDonation = async (
	page: Page,
	donor: DonationWizardDonor,
	options: { coverTransactionCosts?: boolean } = {},
) => {
	await openDonationWizardFromHero(page, MONTHLY_INCOME, { cadence: 'monthly' });
	await completeMonthlyPlanStep(page);
	await completeStripePaymentMethodStep(page, options);
	await completeStripeEmbeddedCheckout(page, donor);
	await completeStripeOnboardingStep(page, donor, 'female');
	await completeReferralStep(page, 'social_media');
};

describeDonationWizardStripeE2e('donation wizard monthly stripe', () => {
	test.beforeEach(async () => {
		await seedDatabase();
	});

	test('monthly donation via Stripe creates a subscription with cover transaction costs enabled', async ({ page }) => {
		const donor = {
			firstName: 'Monthly',
			lastName: 'StripeDonor',
			email: `donation-wizard.monthly-stripe.${Date.now()}@example.com`,
		};

		await deleteDonationWizardTestUser(donor.email);

		try {
			await expectNoDonationWizardRecords(donor.email);
			await completeMonthlyStripeDonation(page, donor);
			await expectContributorOnboardingCompleted(donor.email, { gender: 'female', country: 'CH' });

			const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
			await waitForStripeSubscription(stripeCustomerId, {
				unitAmount: amountToStripeUnitAmount(MONTHLY_DONATION_WITH_FEES),
				coverTransactionCosts: true,
			});
		} finally {
			await deleteDonationWizardTestUser(donor.email);
		}
	});

	test('monthly donation via Stripe without cover costs creates a subscription at the base amount', async ({ page }) => {
		const donor = {
			firstName: 'Monthly',
			lastName: 'StripeNoCover',
			email: `donation-wizard.monthly-stripe-no-cover.${Date.now()}@example.com`,
		};

		await deleteDonationWizardTestUser(donor.email);

		try {
			await completeMonthlyStripeDonation(page, donor, { coverTransactionCosts: false });

			const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
			await waitForStripeSubscription(stripeCustomerId, {
				unitAmount: amountToStripeUnitAmount(MONTHLY_DONATION_BASE),
				coverTransactionCosts: false,
			});
		} finally {
			await deleteDonationWizardTestUser(donor.email);
		}
	});
});
