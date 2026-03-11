import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('partner-space home-page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.partnerSpaceRecipients);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
