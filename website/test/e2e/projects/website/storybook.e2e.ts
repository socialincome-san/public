import { expect, test } from '@playwright/test';

test('storybook design system page is served from the website and marked as noindex', async ({ page }) => {
	const response = await page.goto('/storybook/index.html?path=/docs/design-system--docs');

	expect(response?.ok()).toBeTruthy();
	expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
	await expect(page).toHaveTitle(/Storybook/);
	await expect(page.getByRole('heading', { name: 'Design System' })).toBeVisible();
});
