import { expect, test } from '@playwright/test';

test('management contributions page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/contributions');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
