import { expect, test } from '@playwright/test';
import { LocaleLanguage } from '../../../shared/src/types';
import { renderEmailTemplate } from '../../../shared/src/utils/templates';

test('test rendering demo email', async ({ page }) => {
	const html = await renderEmailTemplate({
		language: LocaleLanguage.German,
		translationNamespace: 'email-demo',
		hbsTemplatePath: 'email/demo.hbs',
		context: { name: 'John', amount: 100, currency: 'EUR' },
	});
	await page.setContent(html);
	await expect(page).toHaveScreenshot();
});
