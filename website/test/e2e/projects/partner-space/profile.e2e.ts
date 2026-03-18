import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('partner-space profile-page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/profile');
	await expectToHaveScreenshot(page);
});

test('partner-space profile updates local partner contact info', async ({ page }) => {
	const updatedFirstName = `Partner-${Date.now()}`;

	await page.goto('/partner-space/profile');
	await page.locator('input[name="firstName"]').fill(updatedFirstName);
	await page.locator('button[type="submit"]').click();

	await expect
		.poll(async () => {
			const localPartner = await prisma.localPartner.findFirst({
				where: { contact: { email: 'test@partner.org' } },
				select: { contact: { select: { firstName: true } } },
			});

			return localPartner?.contact.firstName ?? null;
		})
		.toBe(updatedFirstName);
});
