import { expect, type Locator, type Page } from '@playwright/test';
import type { DonationWizardDonor } from './donation-wizard-db';

const STEP_TIMEOUT_MS = 60_000;

const wizard = (page: Page): Locator => page.getByTestId('donation-wizard-modal');

const waitForWizardStep = async (scope: Locator, stepTestId: string) => {
	await expect(scope.getByTestId(stepTestId)).toBeVisible({ timeout: STEP_TIMEOUT_MS });
};

const fillFormInput = async (scope: Locator, fieldName: string, value: string) => {
	const input = scope.getByTestId(`form-item-${fieldName}`).locator('input');
	await input.fill(value);
	await input.blur();
};

const clickWizardButton = async (scope: Locator, testId: string) => {
	const button = scope.getByTestId(testId);
	await expect(button).toBeEnabled();
	await button.click();
};

export const openDonationWizard = async (page: Page) => {
	await page.goto('/en/int/new-website');
	await page.getByTestId('donation-wizard-trigger').click();
	await expect(wizard(page)).toBeVisible();
	await waitForWizardStep(wizard(page), 'donation-wizard-step-amount');
};

export const completeAmountStep = async (page: Page, monthlyIncome: number) => {
	const modal = wizard(page);
	const incomeInput = modal.getByTestId('donation-wizard-monthly-income');
	const expectedOnePercent = Math.round(monthlyIncome / 100);

	await incomeInput.click();
	await incomeInput.fill(String(monthlyIncome));
	await incomeInput.blur();
	await expect(modal.getByTestId('donation-wizard-one-percent')).toContainText(String(expectedOnePercent));
	await modal.getByTestId('donation-wizard-one-percent').click();
	await modal.getByTestId('donation-wizard-cadence-monthly').click();
	await modal.getByTestId('donation-wizard-amount-continue').click();
	await waitForWizardStep(modal, 'donation-wizard-step-monthly-plan');
};

export const completeMonthlyPlanStep = async (page: Page) => {
	const modal = wizard(page);

	await expect(modal.getByTestId('donation-wizard-plan-tier-1x')).toHaveAttribute('aria-pressed', 'true');
	await clickWizardButton(modal, 'donation-wizard-continue');
	await waitForWizardStep(modal, 'donation-wizard-step-payment');
};

export const completeQrPaymentMethodStep = async (page: Page) => {
	const modal = wizard(page);

	await expect(modal.getByTestId('donation-wizard-payment-qr')).toHaveAttribute('aria-pressed', 'true');
	await clickWizardButton(modal, 'donation-wizard-continue');
	await waitForWizardStep(modal, 'donation-wizard-step-qr-contact');
};

export const completeQrContactStep = async (page: Page, donor: DonationWizardDonor) => {
	const modal = wizard(page);

	await fillFormInput(modal, 'firstName', donor.firstName);
	await fillFormInput(modal, 'lastName', donor.lastName);
	await fillFormInput(modal, 'email', donor.email);

	await clickWizardButton(modal, 'donation-wizard-qr-generate');
	await waitForWizardStep(modal, 'donation-wizard-step-qr-bill');
	await expect(modal.getByTestId('donation-wizard-qr-code')).toBeVisible();
};

export const confirmQrStandingOrder = async (page: Page) => {
	const modal = wizard(page);

	await clickWizardButton(modal, 'donation-wizard-continue');
	await waitForWizardStep(modal, 'donation-wizard-step-onboarding');
};

export const completeOnboardingStep = async (page: Page, gender: 'female' | 'male' | 'private' = 'female') => {
	const modal = wizard(page);

	await modal.getByTestId(`radio-card-${gender}`).click();
	await clickWizardButton(modal, 'donation-wizard-onboarding-submit');
	await waitForWizardStep(modal, 'donation-wizard-step-referral');
};

export const completeReferralStep = async (
	page: Page,
	referral:
		| 'family_and_friends'
		| 'social_media'
		| 'presentation'
		| 'media'
		| 'prefer_not_to_say'
		| 'other' = 'social_media',
) => {
	const modal = wizard(page);

	await modal.getByTestId(`radio-card-${referral}`).click();
	await clickWizardButton(modal, 'donation-wizard-referral-submit');
	await waitForWizardStep(modal, 'donation-wizard-step-thank-you');
};
