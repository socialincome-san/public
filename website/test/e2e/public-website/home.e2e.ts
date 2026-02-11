import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';

test.beforeEach(async ({}, testInfo) => {
	await setupStoryblokMock(testInfo);
});

test.afterEach(async ({}, testInfo) => {
	await saveStoryblokMock(testInfo);
});

test('footer contains linkedin and instagram', async ({ page }) => {
	await page.goto('/en/int/new-website');

	await expect(page.getByText('LinkedIn')).toBeVisible();
	await expect(page.getByText('Instagram')).toBeVisible();
});
