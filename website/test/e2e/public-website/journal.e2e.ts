import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';

test.beforeEach(async ({}, testInfo) => {
	await setupStoryblokMock(testInfo);
});

test.afterEach(async ({}, testInfo) => {
	await saveStoryblokMock(testInfo);
});

test('Journal Page matches Screenshot', async ({ page }) => {
	await page.goto('/en/int/journal');
	await page.waitForTimeout(10000);

	await expect(page).toHaveScreenshot({ fullPage: true });
});
