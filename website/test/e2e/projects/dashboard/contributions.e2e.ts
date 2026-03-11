import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('dashboard contributions-page matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboardContributions}`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
