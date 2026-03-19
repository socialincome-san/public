import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('monitoring upcoming onboarding page renders table and tab', async ({ page }) => {
	await page.goto('/portal/monitoring/upcoming-onboarding');

	await expect(page.getByRole('link', { name: 'Upcoming Onboarding' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Upcoming Onboarding/i })).toBeVisible();
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});
