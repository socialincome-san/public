import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('monitoring upcoming surveys page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalMonitoringUpcomingSurveys);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
