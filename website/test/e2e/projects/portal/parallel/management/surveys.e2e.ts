import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('management surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/surveys');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
