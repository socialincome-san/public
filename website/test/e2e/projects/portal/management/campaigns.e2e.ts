import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { defaultLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const getCampaignTitle = async (slug: string) => {
	const result = await services.storyblok.getCampaigns(defaultLanguage);
	expect(result.success).toBe(true);

	return getStoryblokCampaignTitleForSlug(result.success ? result.data : [], slug);
};

test('lists campaigns belonging to the active organization', async ({ page }) => {
	const existing = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-core-sl-default' },
		select: { slug: true },
	});
	expect(existing?.slug).toBeTruthy();
	const title = await getCampaignTitle(existing!.slug!);

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(title)}`);
	await expect(page.getByRole('cell', { name: title })).toBeVisible();
});

test('does not show owner-only campaign rows under management', async ({ page }) => {
	const ownerOnly = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-health-lr-default' },
		select: { slug: true },
	});
	expect(ownerOnly?.slug).toBeTruthy();
	const title = await getCampaignTitle(ownerOnly!.slug!);

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(title)}`);
	await expect(page.getByText(title, { exact: true })).toBeHidden();
});
