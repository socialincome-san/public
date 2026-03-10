import { expect, test } from '@playwright/test';

test('partner-space not found page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/does-not-exist');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
