import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import Stripe from 'stripe';
import { loginContributorViaEmailLink } from '../../utils';
import {
	deleteDonationWizardTestUser,
	expectContributorOnboardingCompleted,
	expectContributorStripeSubscription,
	expectNoDonationWizardRecords,
	getContributorStripeCustomerId,
} from './utils/donation-wizard-db';
import {
	closeCompletedDonationWizard,
	completeMonthlyPlanStep,
	completeReferralStep,
	completeStripeOnboardingStep,
	completeStripePaymentMethodStep,
	openDonationWizardFromHero,
} from './utils/donation-wizard-flow';
import { completeStripeEmbeddedCheckout } from './utils/donation-wizard-stripe';

const MONTHLY_INCOME = 7500;
const MONTHLY_DONATION_BASE = 75;
const MONTHLY_DONATION_WITH_FEES = 77.25;

const waitForStripeSubscription = async (stripeCustomerId: string) => {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		throw new Error('STRIPE_SECRET_KEY is required for Stripe e2e assertions');
	}

	const stripe = new Stripe(stripeSecretKey);

	await expect
		.poll(async () => {
			const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1, status: 'all' });

			return subscriptions.data.length;
		})
		.toBeGreaterThan(0);
};

const waitForContributorStripeSubscription = async (
	email: string,
	expected: { amount: number; coverTransactionCosts: boolean },
) => {
	await expect
		.poll(async () => {
			try {
				await expectContributorStripeSubscription(email, expected);

				return true;
			} catch {
				return false;
			}
		})
		.toBe(true);
};

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
		await openDonationWizardFromHero(page, MONTHLY_INCOME, { cadence: 'monthly' });
		await completeMonthlyPlanStep(page);

		await expectNoDonationWizardRecords(donor.email);

		await completeStripePaymentMethodStep(page);
		await completeStripeEmbeddedCheckout(page, donor);

		await completeStripeOnboardingStep(page, donor, 'female');
		await expectContributorOnboardingCompleted(donor.email, { gender: 'female', country: 'CH' });

		await completeReferralStep(page, 'social_media');

		const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
		await waitForStripeSubscription(stripeCustomerId);
		await waitForContributorStripeSubscription(donor.email, {
			amount: MONTHLY_DONATION_WITH_FEES,
			coverTransactionCosts: true,
		});
	} finally {
		await deleteDonationWizardTestUser(donor.email);
	}
});

test('monthly donation via Stripe without cover costs can opt in from the dashboard', async ({ page }) => {
	const donor = {
		firstName: 'Monthly',
		lastName: 'StripeDashboard',
		email: `donation-wizard.monthly-stripe-dashboard.${Date.now()}@example.com`,
	};

	await deleteDonationWizardTestUser(donor.email);

	try {
		await openDonationWizardFromHero(page, MONTHLY_INCOME, { cadence: 'monthly' });
		await completeMonthlyPlanStep(page);
		await completeStripePaymentMethodStep(page, { coverTransactionCosts: false });
		await completeStripeEmbeddedCheckout(page, donor);
		await completeStripeOnboardingStep(page, donor, 'female');
		await completeReferralStep(page, 'social_media');
		await closeCompletedDonationWizard(page);

		const stripeCustomerId = await getContributorStripeCustomerId(donor.email);
		await waitForStripeSubscription(stripeCustomerId);
		await waitForContributorStripeSubscription(donor.email, {
			amount: MONTHLY_DONATION_BASE,
			coverTransactionCosts: false,
		});

		await loginContributorViaEmailLink(page, donor.email);

		await page.goto('/en/ch/dashboard/subscriptions');
		await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();
		await expect(page.getByTestId('cover-subscription-transaction-costs-prompt')).toBeVisible();

		await page.getByTestId('cover-subscription-transaction-costs-prompt').click();
		await expect(page.getByTestId('edit-subscription-step')).toBeVisible();
		await expect(page.getByTestId('cover-transaction-costs-switch')).toBeChecked();
		await expect(page.getByTestId('edit-subscription-total')).toContainText('CHF 77.25');
		await page.getByRole('button', { name: 'Update Subscription' }).click();
		await expect(page.getByTestId('edit-subscription-success-step')).toBeVisible();
		await page.getByTestId('edit-subscription-done').click();

		await waitForContributorStripeSubscription(donor.email, {
			amount: MONTHLY_DONATION_WITH_FEES,
			coverTransactionCosts: true,
		});

		await expect(page.getByTestId('cover-subscription-transaction-costs-prompt')).toHaveCount(0);
	} finally {
		await deleteDonationWizardTestUser(donor.email);
	}
});
