import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const STORYBLOK_RECORDING = 'public-website-home-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website home page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto('/en/int/new-website');
	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
