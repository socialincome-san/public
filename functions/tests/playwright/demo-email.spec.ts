import { expect, test } from '@playwright/test';
import { renderEmailTemplate } from '../../../shared/src/utils/templates';

test('test rendering demo email', async ({ page }) => {
	const html = await renderEmailTemplate({
		language: 'de',
		translationNamespace: 'email-demo',
		hbsTemplatePath: 'demo',
		context: { name: 'John', amount: 100, currency: 'EUR' },
	});
	await page.setContent(html);
	await expect(page).toHaveScreenshot();
});
