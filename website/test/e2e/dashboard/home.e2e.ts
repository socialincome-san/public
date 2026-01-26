import { expect, test } from '@playwright/test';

test('dashboard home-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/contributions');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
