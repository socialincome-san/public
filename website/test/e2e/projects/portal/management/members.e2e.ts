import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('management members page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalManagementMembers);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
