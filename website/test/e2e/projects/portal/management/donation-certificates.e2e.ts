import { expect, test } from '@playwright/test';
import { ROUTES } from '@/lib/constants/routes';

test('management donation certificates page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalManagementDonationCertificates);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
