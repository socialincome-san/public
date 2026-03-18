import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';

const STORYBLOK_RECORDING = 'public-website-slug-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website slug page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto('/en/int/new-website/example');

	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
