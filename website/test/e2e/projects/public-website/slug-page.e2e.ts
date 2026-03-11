import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';

const STORYBLOK_RECORDING = 'public-website-slug-page';

test('new website slug page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto(`${ROUTES.websiteHome}/new-website/example`);

	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
