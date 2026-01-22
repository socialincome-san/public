import { expect, test } from '@playwright/test';

test('partner-space home-page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/recipients');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
