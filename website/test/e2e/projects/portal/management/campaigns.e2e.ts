import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('lists campaigns belonging to the active organization', async ({ page }) => {
	const existing = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-core-sl-default' },
		select: { title: true },
	});
	expect(existing?.title).toBeTruthy();

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(existing!.title)}`);
	await expect(page.getByRole('cell', { name: existing!.title })).toBeVisible();
});

test('does not show owner-only campaign rows under management', async ({ page }) => {
	const ownerOnly = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-health-lr-default' },
		select: { title: true },
	});
	expect(ownerOnly).toBeTruthy();

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(ownerOnly!.title)}`);
	await expect(page.getByText(ownerOnly!.title, { exact: true })).toBeHidden();
});
