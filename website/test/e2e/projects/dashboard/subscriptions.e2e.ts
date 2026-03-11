import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('dashboard subscriptions-page matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboardSubscriptions}`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
