import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';

test.beforeEach(async (_args, testInfo) => {
	await setupStoryblokMock(testInfo);
});

test.afterEach(async (_args, testInfo) => {
	await saveStoryblokMock(testInfo);
});

test('new website slug page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/new-website/example');

	await expect(page).toHaveScreenshot({ fullPage: true });
});
