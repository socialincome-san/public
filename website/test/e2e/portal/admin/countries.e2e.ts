import { expect, test } from '@playwright/test';

test('Add new country', async ({ page }) => {
	await page.goto('http://localhost:3000/portal/admin/countries');
	await page.getByRole('button', { name: 'Add country' }).click();

	await page.getByRole('combobox').filter({ hasText: 'Select country' }).click();
	await page.getByPlaceholder('Search...').fill('switzer');
	await page.getByRole('option', { name: 'Switzerland' }).click();

	await page.getByPlaceholder('4.92').fill('1.11');

	await page.getByRole('textbox', { name: 'WFP', exact: true }).fill('source text');

	await page.getByRole('textbox', { name: 'https://www.wfp.org' }).fill('https://source-url.ch');

	await page.getByPlaceholder('85').fill('82.3');

	await page.getByRole('button', { name: 'Select date' }).press('Enter');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

	await page.locator('[aria-placeholder="3G"]').click();
	await page.getByRole('option', { name: '5G' }).click();

	await page.getByRole('button', { name: 'Save' }).click();

	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});
