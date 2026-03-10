import { expect, test } from '@playwright/test';

test('program recipients page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-1/recipients');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
