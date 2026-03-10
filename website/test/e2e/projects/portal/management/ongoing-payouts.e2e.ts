import { expect, test } from '@playwright/test';

test('management ongoing payouts page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/ongoing-payouts');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
