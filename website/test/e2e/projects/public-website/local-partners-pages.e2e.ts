import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const LOCAL_PARTNERS_OVERVIEW_RECORDING = 'public-website-local-partners-overview-page';
const LOCAL_PARTNER_EBOLA_SURVIVORS_RECORDING = 'public-website-local-partner-ebola-survivors-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website local partners overview page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(LOCAL_PARTNERS_OVERVIEW_RECORDING);
	await page.goto('/de/int/new-website/local-partners');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(LOCAL_PARTNERS_OVERVIEW_RECORDING);
});

test('new website local partner detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(LOCAL_PARTNER_EBOLA_SURVIVORS_RECORDING);
	await page.goto('/de/int/new-website/local-partners/ebola-survivors');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(LOCAL_PARTNER_EBOLA_SURVIVORS_RECORDING);
});
