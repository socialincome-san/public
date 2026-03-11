import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('monitoring payout confirmation page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalMonitoringPayoutConfirmation);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
