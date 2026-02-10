import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('portal home-page matches screenshot', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
