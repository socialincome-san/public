import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard not found page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/does-not-exist');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
