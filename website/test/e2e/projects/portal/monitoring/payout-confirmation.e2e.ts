import { expect, test } from '@playwright/test';

test('monitoring payout confirmation page matches screenshot', async ({ page }) => {
	await page.goto('/portal/monitoring/payout-confirmation');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
