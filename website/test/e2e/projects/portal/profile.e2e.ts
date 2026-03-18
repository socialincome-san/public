import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('portal profile-page matches screenshot', async ({ page }) => {
	await page.goto('/portal/profile');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('portal profile updates user personal info', async ({ page }) => {
	const updatedFirstName = `Portal-${Date.now()}`;

	await page.goto('/portal/profile');
	await page.locator('input[name="firstName"]').fill(updatedFirstName);
	await page.locator('button[type="submit"]').click();

	await expect
		.poll(async () => {
			const user = await prisma.user.findFirst({
				where: { contact: { email: 'test@portal.org' } },
				select: { contact: { select: { firstName: true } } },
			});

			return user?.contact.firstName ?? null;
		})
		.toBe(updatedFirstName);
});
