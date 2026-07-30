import { expect, test } from '@playwright/test';

test.describe('campaign submission', () => {
	test('opens the create campaign form from the overview page', async ({ page }) => {
		await page.goto('/en/ch/campaigns');
		await page.getByRole('button', { name: 'Create campaign' }).click();
		await expect(page.getByRole('heading', { name: 'Create a campaign' })).toBeVisible();
		await expect(page.getByLabel('Title')).toBeVisible();
		await expect(page.getByLabel('Fundraising goal')).toBeVisible();
		await expect(page.getByLabel('Primary image')).toBeVisible();
	});
});
