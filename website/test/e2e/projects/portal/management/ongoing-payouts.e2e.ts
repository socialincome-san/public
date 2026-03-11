import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('management ongoing payouts page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalManagementOngoingPayouts);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
