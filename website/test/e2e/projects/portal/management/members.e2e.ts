import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('management members page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalManagementMembers);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
