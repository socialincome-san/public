import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('Program ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalProgramOverview('program-1'));
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Program not ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalProgramOverview('program-2'));
	await expect(page).toHaveScreenshot({ fullPage: true });
});
