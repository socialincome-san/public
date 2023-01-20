import { renderEmailTemplate, renderTemplate } from '../src/utils/templates';
import { translate } from '../src/utils/translate';

describe('', () => {
	it('Render basic template', async () => {
		const deContent = await renderTemplate({
			language: 'de',
			namespace: 'template-email',
			context: { language: 'de', name: 'John', amount: 100, currency: 'EUR' },
		});

		console.log(deContent);
		const enContent = await renderTemplate({
			language: 'en',
			namespace: 'template-email',
			context: { language: 'de', name: 'Anna', amount: 200, currency: 'EUR' },
		});
		console.log(enContent);
	});

	it('Render email template', async () => {
		const email = await renderEmailTemplate({
			language: 'de',
			namespace: 'template-email',
			context: { language: 'de', name: 'Anna', amount: 200, currency: 'EUR' },
		});
		console.log(email);
	});

	it('Test translation', async () => {
		const greeting = await translate({
			language: 'de',
			namespace: 'template-email',
			key: 'greeting',
			context: { name: 'John' },
		});
		console.log(greeting);
	});
});
