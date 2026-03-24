import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website impact measurement page matches initial screenshot', async ({ page }) => {
	await page.goto('/de/ch/new-website/programs/impact-measurement');
	await expect(page.getByText('Wofür gibst du dein Social Income hauptsächlich aus?')).toBeVisible();
	await page.getByTestId('impact-measurement-study-details-trigger').click();

	await expectToHaveScreenshot(page, true);
});

test('new website impact measurement page supports filters and matches filtered screenshot', async ({ page }) => {
	await page.goto('/de/ch/new-website/programs/impact-measurement');
	await expect(page.getByText('Wofür gibst du dein Social Income hauptsächlich aus?')).toBeVisible();
	await page.getByTestId('impact-measurement-study-details-trigger').click();

	await page.getByTestId('impact-measurement-filters-trigger').click();
	await page.getByRole('option', { name: 'Liberia, not selected', exact: true }).click();
	await page.getByRole('option', { name: 'Jugendliche (16-25), not selected', exact: true }).click();
	await page.getByRole('option', { name: 'Weiblich, not selected', exact: true }).click();
	await page.keyboard.press('Escape');

	await expect(page).toHaveURL(
		'http://localhost:3000/de/ch/new-website/programs/impact-measurement?country=LR&recipientFilters=youth%2Cfemale',
	);
	await page.getByTestId('impact-measurement-study-details-trigger').click();
	await expect(page.getByText('Wofür gibst du dein Social Income hauptsächlich aus?')).toBeVisible();
	await expectToHaveScreenshot(page, true);
});
