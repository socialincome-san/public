import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard not found page matches screenshot', async ({ page }) => {
	await page.goto('/en/usd/dashboard/does-not-exist');
	await expectToHaveScreenshot(page);
});
