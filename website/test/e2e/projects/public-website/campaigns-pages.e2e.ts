import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const CAMPAIGNS_OVERVIEW_RECORDING = 'public-website-campaigns-overview-page';
const CAMPAIGN_DETAIL_RECORDING = 'public-website-campaign-si-core-program-sl-default-campaign-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website campaigns overview page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(CAMPAIGNS_OVERVIEW_RECORDING);
	await page.goto('/de/ch/new-website/campaigns');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(CAMPAIGNS_OVERVIEW_RECORDING);
});

test('new website campaign detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(CAMPAIGN_DETAIL_RECORDING);
	await page.goto('/de/ch/new-website/campaigns/si-core-program-sl-default-campaign');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(CAMPAIGN_DETAIL_RECORDING);
});
