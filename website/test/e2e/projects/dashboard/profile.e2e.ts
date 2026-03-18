import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard profile-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/profile');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('dashboard profile updates contributor personal info', async ({ page }) => {
	const updatedFirstName = `Contributor-${Date.now()}`;

	await page.goto('/en/int/dashboard/profile');
	await page.locator('input[name="firstName"]').fill(updatedFirstName);
	await page.locator('button[type="submit"]').click();

	await expect
		.poll(async () => {
			const contributor = await prisma.contributor.findFirst({
				where: { contact: { email: 'test@dashboard.org' } },
				select: { contact: { select: { firstName: true } } },
			});

			return contributor?.contact.firstName ?? null;
		})
		.toBe(updatedFirstName);
});
