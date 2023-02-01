import { renderEmailTemplate } from '../../src/utils/templates';

describe('', () => {
	it('Render basic template', async () => {
		await renderEmailTemplate({
			language: 'de',
			translationNamespace: 'email-demo',
			hbsTemplatePath: 'email/demo.hbs',
			context: { language: 'de', name: 'John', amount: 100, currency: 'EUR' },
		});
	});
});
