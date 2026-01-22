import { expect, test } from '@playwright/test';

test('Home page displays main message', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByText('How many people can you lift out of poverty with only 1% of your income?'),
	).toBeVisible();
});
