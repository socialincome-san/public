import { expect, test, type Page } from '@playwright/test';

const openHeroCustomAmount = async (page: Page) => {
	await page.goto('/en/chf');
	const heroForm = page.getByTestId('donation-wizard-hero-form').first();
	await expect(heroForm).toBeVisible();
	await heroForm.getByTestId('donation-wizard-custom-amount').click();

	return heroForm;
};

test('a custom amount chip fills the custom amount', async ({ page }) => {
	const heroForm = await openHeroCustomAmount(page);

	await heroForm.getByRole('button', { name: 'CHF 60', exact: true }).click();

	await expect(heroForm.getByTestId('donation-wizard-custom-amount')).toHaveValue('60');
	await expect(heroForm.getByTestId('donation-wizard-amount-continue')).toHaveText('Donate CHF 60 monthly');
});

test('custom amount chips are reachable with the keyboard', async ({ page }) => {
	const heroForm = await openHeroCustomAmount(page);
	const chip = heroForm.getByRole('button', { name: 'CHF 40', exact: true });

	await page.keyboard.press('Tab');
	await expect(chip).toBeFocused();
	await page.keyboard.press('Enter');

	await expect(heroForm.getByTestId('donation-wizard-custom-amount')).toHaveValue('40');
	await expect(chip).toHaveAttribute('aria-pressed', 'true');
});
