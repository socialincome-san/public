import { expect, test } from '@playwright/test';

test('dashboard not found page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/does-not-exist');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
