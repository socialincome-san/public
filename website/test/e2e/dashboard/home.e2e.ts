import { expect, test } from '@playwright/test';

test('dashboard home matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/contributions');
	await expect(page).toHaveScreenshot();
});
