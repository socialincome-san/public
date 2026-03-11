import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('partner-space candidates page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.partnerSpaceCandidates);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
