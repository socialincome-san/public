import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';

test.beforeEach(async ({}, testInfo) => {
  await setupStoryblokMock(testInfo);
});

test.afterEach(async ({}, testInfo) => {
  await saveStoryblokMock(testInfo);
});

test('new website home page matches screenshot', async ({ page }) => {
  await page.goto('/en/int/new-website');

  await expect(page).toHaveScreenshot({ fullPage: true });
});
