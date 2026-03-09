import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('management recipients page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/recipients');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
