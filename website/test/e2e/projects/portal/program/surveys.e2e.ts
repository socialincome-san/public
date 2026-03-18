import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('program surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-1/surveys?sortBy=dueAt&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});
