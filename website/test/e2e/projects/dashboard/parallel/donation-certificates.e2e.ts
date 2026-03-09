import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('dashboard donation certificates page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/donation-certificates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
