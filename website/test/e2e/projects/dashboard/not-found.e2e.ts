import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('dashboard not found page matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboard}/does-not-exist`);
	await expect(page).toHaveScreenshot({ fullPage: true });
});
