import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';

const STORYBLOK_RECORDING = 'public-website-home-page';

test('new website home page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto('/en/int/new-website');

	await page.waitForLoadState('networkidle');

	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
