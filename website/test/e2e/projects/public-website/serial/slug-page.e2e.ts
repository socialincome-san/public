import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../../mock-server/storyblok-mock';

test.describe.configure({ mode: 'serial' });

const STORYBLOK_RECORDING = 'setup-portal/seed-and-login-portal-actor';

test('new website slug page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto('/en/int/new-website/example');

	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
