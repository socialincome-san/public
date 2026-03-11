import { expect, test } from '@playwright/test';

test('dashboard profile-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/profile');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
