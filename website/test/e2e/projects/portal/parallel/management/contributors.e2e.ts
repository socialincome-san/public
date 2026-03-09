import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('management contributors page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/contributors');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
