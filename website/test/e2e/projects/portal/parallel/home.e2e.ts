import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('portal home-page matches screenshot', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('country list in create program wizard matches screenshot', async ({ page }) => {
	await page.goto('/portal');

	await page.getByTestId('create-program-modal-trigger').click();

	for (const countryLabel of ['Algeria', 'Angola', 'Burkina Faso', 'Ethiopia', 'Kenya', 'Malawi', 'Tanzania']) {
		await page.getByRole('cell', { name: countryLabel }).click();
	}

	await page.getByRole('dialog').evaluate((element) => {
		const dialog = element as HTMLElement;
		dialog.style.maxHeight = 'none';
		dialog.style.overflow = 'visible';
	});
	await page.getByTestId('country-table').evaluate((element) => {
		const table = element as HTMLElement;
		table.style.maxHeight = 'none';
		table.style.overflow = 'visible';
	});

	await expect(page.getByTestId('country-table')).toHaveScreenshot();
});
