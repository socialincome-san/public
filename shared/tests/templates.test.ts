import { renderTemplate } from '../src/utils/templates';
import { translate } from '../src/utils/translate';

describe('', () => {
	it('should render', async () => {
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

		const greeting = await translate({
			language: 'de',
			namespace: 'template-email',
			key: 'greeting',
			context: { name: 'John' },
		});
		console.log(greeting);
	});
});
