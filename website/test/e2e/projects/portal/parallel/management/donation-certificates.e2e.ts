import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });


test('management donation certificates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/donation-certificates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
