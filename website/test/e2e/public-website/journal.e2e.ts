import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';

test.beforeEach(async ({}, testInfo) => {
	await setupStoryblokMock(testInfo);
});

test.afterEach(async ({ page }, testInfo) => {
	await saveStoryblokMock(testInfo, page);
});

test('Journal page', async ({ page }) => {
	await page.goto('/en/int/journal');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
