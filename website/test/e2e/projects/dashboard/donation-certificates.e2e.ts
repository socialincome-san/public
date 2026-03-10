import { expect, test } from '@playwright/test';

test('dashboard donation certificates page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/donation-certificates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
