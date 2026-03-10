import { expect, test } from '@playwright/test';

test('portal profile-page matches screenshot', async ({ page }) => {
	await page.goto('/portal/profile');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
