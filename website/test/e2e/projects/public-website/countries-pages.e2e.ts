import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const COUNTRIES_OVERVIEW_RECORDING = 'public-website-countries-overview-page';
const SIERRA_LEONE_RECORDING = 'public-website-country-sierra-leone-page';
const LIBERIA_RECORDING = 'public-website-country-liberia-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website countries overview page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(COUNTRIES_OVERVIEW_RECORDING);
	await page.goto('/de/int/new-website/countries');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(COUNTRIES_OVERVIEW_RECORDING);
});

test('new website country detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(SIERRA_LEONE_RECORDING);
	await page.goto('/de/int/new-website/countries/sierra-leone');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(SIERRA_LEONE_RECORDING);
});

test('new website liberia country detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(LIBERIA_RECORDING);
	await page.goto('/de/int/new-website/countries/liberia');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(LIBERIA_RECORDING);
});
