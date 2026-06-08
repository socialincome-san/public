import { expect, type FrameLocator, type Page } from '@playwright/test';
import Stripe from 'stripe';
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
		await zipField.fill('8001');

		const saveCheckbox = scope.getByRole('checkbox', { name: 'Save my information for' });
		if (await saveCheckbox.count()) {
			await saveCheckbox.uncheck();
		}
	}

	const phoneField = scope.getByRole('textbox', { name: 'Phone' });
	if (await phoneField.count()) {
		await phoneField.fill('+41791234567');
	}

	await scope.getByTestId('hosted-payment-submit-button').click();
};

export const syncStripeChargeWebhookForCustomer = async (stripeCustomerId: string, baseUrl = 'http://localhost:3000') => {
	const secretKey = process.env.STRIPE_SECRET_KEY;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!secretKey || !webhookSecret) {
		throw new Error('STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required for webhook sync');
	}

	const stripe = new Stripe(secretKey);
	const charges = await stripe.charges.list({ customer: stripeCustomerId, limit: 1 });
	const charge = charges.data[0];

	if (!charge) {
		throw new Error(`No Stripe charge found for customer ${stripeCustomerId}`);
	}

	const event = {
		id: `evt_e2e_${charge.id}`,
		object: 'event',
		type: 'charge.succeeded',
		data: { object: charge },
	};
	const payload = JSON.stringify(event);
	const signature = stripe.webhooks.generateTestHeaderString({
		payload,
		secret: webhookSecret,
	});

	const response = await fetch(`${baseUrl}/api/v1/stripe/webhook`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'stripe-signature': signature,
		},
		body: payload,
	});

	if (!response.ok) {
		throw new Error(`Stripe webhook sync failed: ${await response.text()}`);
	}
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
