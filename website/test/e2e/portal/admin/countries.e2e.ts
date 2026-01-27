import { expect, test } from '@playwright/test';

test('Add new country', async ({ page }) => {
	await page.goto('http://localhost:3000/portal/admin/countries');
	await page.getByRole('button', { name: 'Add country' }).click();

	await page.getByTestId('isoCode').click();
	await page.getByPlaceholder('Search').fill('switzer');
	await page.getByRole('option', { name: 'Switzerland' }).click();

	await page.getByTestId('microfinanceIndex').locator('input').fill('1.11');

	await page.getByTestId('microfinanceSourceText').locator('input').fill('source text');

	await page.getByTestId('microfinanceSourceHref').locator('input').fill('https://source-url.ch');

	await page.getByTestId('populationCoverage').locator('input').fill('82.3');
	await page.getByTestId('latestSurveyDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

	await page.getByTestId('networkTechnology').click();
	await page.getByRole('option', { name: '5G' }).click();

	await page.getByTestId('paymentProviders').click();
	await page.getByPlaceholder('Search').fill('Orange Mon');
	await page.getByRole('option', { name: 'Orange Money' }).click();
	await page.getByRole('option', { name: 'Orange Money' }).press('Escape');

	await page.getByTestId('sanctions').click();
	await page.getByPlaceholder('Search').fill('us');
	await page.getByRole('option', { name: 'us' }).click();
	await page.getByRole('option', { name: 'us' }).press('Escape');

	await page.getByRole('button', { name: 'Save' }).click();

	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});
