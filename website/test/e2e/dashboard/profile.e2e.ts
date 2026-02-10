import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard profile-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/profile');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
