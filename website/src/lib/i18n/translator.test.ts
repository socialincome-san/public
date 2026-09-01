import { Translator } from './translator';

describe('Test translations', () => {
	it('German translations', async () => {
		const translator = await Translator.getInstance({
			language: 'de',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('title', { context: { year: 2022 } })).toBe('Spendenbescheinigung 2022');
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Schweiz');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Deutschland');
	});

	it('French translations', async () => {
		const translator = await Translator.getInstance({
			language: 'fr',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Suisse');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Allemagne');
	});

	it('English translations', async () => {
		const translator = await Translator.getInstance({
			language: 'en',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Switzerland');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Germany');
	});

	it('keeps transparency countries headline placeholders for interpolation', async () => {
		const translator = await Translator.getInstance({
			language: 'en',
			namespaces: ['website-common'],
		});

		expect(translator.t('transparency-page.countries.headline', { context: { count: 72 } })).toBe(
			'Donations totaling {{amount}} arrived from {{countriesCount}} countries',
		);
		expect(translator.t('transparency-page.countries.headline', { context: { count: 1 } })).toBe(
			'Donations totaling {{amount}} arrived from {{countriesCount}} country',
		);
		expect(translator.t('transparency-page.countries.headline-country')).toBe(
			'Donations totaling {{amount}} arrived from {{country}}',
		);
	});

	it('uses valid French transparency countries copy', async () => {
		const translator = await Translator.getInstance({
			language: 'fr',
			namespaces: ['website-common'],
		});

		expect(translator.t('transparency-page.countries.headline', { context: { count: 1 } })).toBe(
			'Des dons totalisant {{amount}} sont arrivés de {{countriesCount}} pays',
		);
	});
});
