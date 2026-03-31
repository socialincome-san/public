import { seedDatabase } from '@/lib/database/seed/run-seed';
import { test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../../mock-server/storyblok-mock';
import { expectToHaveScreenshot } from '../../utils';

const PROGRAMS_OVERVIEW_RECORDING = 'public-website-programs-overview-page';
const PROGRAM_SI_CORE_SL_RECORDING = 'public-website-program-si-core-program-sl-page';
const PROGRAM_SI_EDUCATION_GH_PREVIEW_RECORDING = 'public-website-program-si-education-gh-preview-page';

test.beforeEach(async () => {
	await seedDatabase();
});

test('new website programs overview page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(PROGRAMS_OVERVIEW_RECORDING);
	await page.goto('/de/ch/new-website/programs');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(PROGRAMS_OVERVIEW_RECORDING);
});

test('new website program detail page matches screenshot', async ({ page }) => {
	await setupStoryblokMock(PROGRAM_SI_CORE_SL_RECORDING);
	await page.goto('/de/ch/new-website/programs/si-core-program-sl');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(PROGRAM_SI_CORE_SL_RECORDING);
});

test('new website program detail page shows db preview and matches screenshot', async ({ page }) => {
	await setupStoryblokMock(PROGRAM_SI_EDUCATION_GH_PREVIEW_RECORDING);
	await page.goto('/de/ch/new-website/programs/si-education-gh');

	await expectToHaveScreenshot(page, true);
	await saveStoryblokMock(PROGRAM_SI_EDUCATION_GH_PREVIEW_RECORDING);
});

