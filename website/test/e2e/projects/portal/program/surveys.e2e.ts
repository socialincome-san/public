import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('program surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-si-core-sl/surveys');
	await expect(page.getByText('What are the key categories that you spend your Social Income payments on?')).toBeVisible();
	await page.getByTestId('impact-measurement-study-details-trigger').click();
	await expectToHaveScreenshot(page);
});
