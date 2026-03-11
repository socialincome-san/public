import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { ROUTES } from '@/lib/constants/routes';

const STORYBLOK_RECORDING = 'public-website-home-page';

test('new website home page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto(`${ROUTES.websiteHome}/new-website`);

	await page.waitForLoadState('networkidle');

	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
