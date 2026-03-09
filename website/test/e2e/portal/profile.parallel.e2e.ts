import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async () => {
	await seedDatabase();
});

test('portal profile-page matches screenshot', async ({ page }) => {
	await page.goto('/portal/profile');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
