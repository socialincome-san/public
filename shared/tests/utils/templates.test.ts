import { LocaleLanguage } from '../../src/types/admin/Language';
import { renderEmailTemplate } from '../../src/utils/templates';

describe('', () => {
	it('Render basic template', async () => {
		await renderEmailTemplate({
			language: LocaleLanguage.German,
			translationNamespace: 'email-demo',
			hbsTemplatePath: 'email/demo.hbs',
			context: { language: 'de', name: 'John', amount: 100, currency: 'EUR' },
		});
	});
});
