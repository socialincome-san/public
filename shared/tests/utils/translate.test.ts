import { Translator } from '../../src/utils/translate';

describe('Test translations', () => {
	it('German translations', async () => {
		const translator = await Translator.getInstance({
			language: 'de',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('email-subject')).toBe('Social Income Spendenbescheinigung');
		expect(translator.t('title', { context: { year: 2022 } })).toBe('Spendenbescheinigung 2022');
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Schweiz');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Deutschland');
	});

	it('French translations', async () => {
		const translator = await Translator.getInstance({
			language: 'fr',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('email-subject')).toBe('Social Income Attestation de don');
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Suisse');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Allemagne');
	});

	it('English translations', async () => {
		const translator = await Translator.getInstance({
			language: 'en',
			namespaces: ['donation-certificate', 'countries'],
		});
		expect(translator.t('email-subject')).toBe('Social Income Donation Certificate');
		expect(translator.t('CH', { namespace: 'countries' })).toBe('Switzerland');
		expect(translator.t('DE', { namespace: 'countries' })).toBe('Germany');
	});
});
