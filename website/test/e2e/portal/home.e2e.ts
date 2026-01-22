import { expect, test } from '@playwright/test';

test('portal home matches screenshot', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveScreenshot();
});
