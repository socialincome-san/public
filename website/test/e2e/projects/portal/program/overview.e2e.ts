import { expect, test } from '@playwright/test';

test('Program ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-1/overview');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Program not ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-2/overview');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
