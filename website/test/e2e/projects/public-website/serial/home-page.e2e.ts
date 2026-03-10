import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../../mock-server/storyblok-mock';

test.describe.configure({ mode: 'serial' });

const STORYBLOK_RECORDING = 'setup-portal/seed-and-login-portal-actor';

test('new website home page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(STORYBLOK_RECORDING);
	await page.goto('/en/int/new-website');

	await page.getByText('text in header').isVisible();
	await page.getByText('text in footer').isVisible();

	await page.waitForTimeout(3000);

	await expect(page).toHaveScreenshot({ fullPage: true });
	await saveStoryblokMock(STORYBLOK_RECORDING);
});
