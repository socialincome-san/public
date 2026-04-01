import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const FOCUSES_OVERVIEW_RECORDING = 'public-website-focuses-overview-page';
const FOCUS_POVERTY_RECORDING = 'public-website-focus-poverty-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website focuses overview page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(FOCUSES_OVERVIEW_RECORDING);
	await page.goto('/de/int/new-website/focuses');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(FOCUSES_OVERVIEW_RECORDING);
});

test('new website focus detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(FOCUS_POVERTY_RECORDING);
	await page.goto('/de/int/new-website/focuses/poverty');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(FOCUS_POVERTY_RECORDING);
});
