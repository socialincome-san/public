import { createTranslator } from 'next-intl';
import { loadMessages } from './messages';

describe('loadMessages', () => {
	it('formats ICU plurals in the requested language', async () => {
		const t = createTranslator({ locale: 'de', messages: await loadMessages('de'), namespace: 'website-common' });

		expect(t('transparency-page.countries.headline', { count: 1, amount: '10 $', countriesCount: '1' })).toBe(
			'Spenden im Wert von 10 $ kamen aus 1 Land',
		);
	});

	it('falls back to English for namespaces a language does not translate', async () => {
		const messages = await loadMessages('kri');

		expect(messages['website-common']).toEqual((await loadMessages('en'))['website-common']);
		expect(messages['website-survey']).not.toEqual((await loadMessages('en'))['website-survey']);
	});
});
