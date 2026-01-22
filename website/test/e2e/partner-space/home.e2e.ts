import { expect, test } from '@playwright/test';

test('partner-space home matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/recipients');
	await expect(page).toHaveScreenshot();
});
