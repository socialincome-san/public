import { expect, test } from '@playwright/test';

test('Home page displays main message', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByText('How many people can you lift out of poverty with only 1% of your income?'),
	).toBeVisible();
});

test('Portal redirects to login when not authenticated', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveURL(/\/en\/int\/login/);
	await expect(page.getByText('Sign in to your account')).toBeVisible();
});
