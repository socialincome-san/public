import { expect, type FrameLocator, type Page } from '@playwright/test';
import type { DonationWizardDonor } from './donation-wizard-db';

const STRIPE_CHECKOUT_TIMEOUT_MS = 90_000;

const getStripeCheckoutFrame = (page: Page): FrameLocator => {
	const modal = page.getByTestId('donation-wizard-modal');

	return modal.frameLocator('iframe[src*="stripe"]').first();
};

const fillStripeHostedCheckoutForm = async (scope: Page | FrameLocator, donor: DonationWizardDonor) => {
	await scope.getByRole('textbox', { name: 'Email' }).fill(donor.email);
	await scope.getByRole('textbox', { name: 'Card number' }).fill('4242 4242 4242 4242');
	await scope.getByRole('textbox', { name: 'Expiration' }).fill('12 / 66');
	await scope.getByRole('textbox', { name: 'CVC' }).fill('424');
	await scope.getByRole('textbox', { name: 'Cardholder name' }).fill(`${donor.firstName} ${donor.lastName}`);

	const zipField = scope.getByRole('textbox', { name: 'ZIP' });

	if (await zipField.count()) {
		// Stripe form is rendered IP-dependently; CI may require ZIP (and would require phone if Link is enabled).
		await zipField.fill('12345');
		await scope.getByRole('checkbox', { name: 'Save my information for' }).uncheck();
	}

	await scope.getByTestId('hosted-payment-submit-button').click();
};

export const completeStripeEmbeddedCheckout = async (page: Page, donor: DonationWizardDonor) => {
	const modal = page.getByTestId('donation-wizard-modal');

	await expect(modal.getByTestId('donation-wizard-step-stripe-checkout')).toBeVisible({
		timeout: STRIPE_CHECKOUT_TIMEOUT_MS,
	});

	const stripeCheckout = getStripeCheckoutFrame(page);

	await expect(stripeCheckout.getByRole('textbox', { name: 'Email' })).toBeVisible({
		timeout: STRIPE_CHECKOUT_TIMEOUT_MS,
	});

	await fillStripeHostedCheckoutForm(stripeCheckout, donor);

	await expect(modal.getByTestId('donation-wizard-step-onboarding')).toBeVisible({
		timeout: STRIPE_CHECKOUT_TIMEOUT_MS,
	});
};
