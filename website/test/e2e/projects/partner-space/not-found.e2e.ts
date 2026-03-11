import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('partner-space not found page matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.partnerSpace}/does-not-exist`);
	await expect(page).toHaveScreenshot({ fullPage: true });
});
