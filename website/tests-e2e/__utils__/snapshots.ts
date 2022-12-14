import { expect, test } from '@playwright/test';
import { i18n } from '../../next-i18next.config';

/**
 * Call this function to create a basic snapshot regression test for all supported languages.
 * @param relativeUrl url to test
 */
export const multiLanguageSnapshotTest = (relativeUrl: string) => {
	test.describe(`snapshot regression test for path '${relativeUrl}'`, () => {
		i18n.locales.map((locale) => {
			test(`for ${locale}`, async ({ page }, testinfo) => {
				testinfo.snapshotSuffix = '';
				await page.goto(`http://localhost:3001/${relativeUrl}`);
				await page.waitForSelector('main');
				await expect(page).toHaveScreenshot();
			});
		});
	});
};
