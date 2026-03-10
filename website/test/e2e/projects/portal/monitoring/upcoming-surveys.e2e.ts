import { expect, test } from '@playwright/test';

test('monitoring upcoming surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/monitoring/upcoming-surveys');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
