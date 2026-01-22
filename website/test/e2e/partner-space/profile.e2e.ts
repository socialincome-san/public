import { expect, test } from '@playwright/test';

test('partner-space profile-page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/profile');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
