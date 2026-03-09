import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('program surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-1/surveys');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
