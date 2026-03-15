import { expect, test } from '@playwright/test';

test('partner-space candidates page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/candidates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
