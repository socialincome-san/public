import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('partner-space not found page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/does-not-exist');
	await expectToHaveScreenshot(page);
});
