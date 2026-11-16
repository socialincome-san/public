import { createTranslator } from 'next-intl';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { loadMessages, pickClientMessages } from './messages';

const srcDir = path.join(__dirname, '../..');

describe('loadMessages', () => {
	it('formats ICU plurals in the requested language', async () => {
		const t = createTranslator({ locale: 'de', messages: await loadMessages('de'), namespace: 'website-common' });

		expect(t('transparency-page.countries.headline', { count: 1, amount: '10 $', countriesCount: '1' })).toBe(
			'Spenden im Wert von 10 $ kamen aus 1 Land',
		);
	});

	it.each([
		['de', ['Letzte Antwort heute', 'Letzte Antwort gestern', 'Letzte Antwort vor 5 Tagen']],
		['en', ['Last response today', 'Last response yesterday', 'Last response 5d ago']],
		['fr', ['Dernière réponse aujourd’hui', 'Dernière réponse hier', 'Dernière réponse il y a 5 j']],
		['it', ['Ultima risposta oggi', 'Ultima risposta ieri', 'Ultima risposta 5 giorni fa']],
	] as const)('formats the last survey response age in %s', async (locale, [today, yesterday, daysAgo]) => {
		const t = createTranslator({ locale, messages: await loadMessages(locale), namespace: 'website-survey' });

		expect(t('survey.impactMeasurement.lastResponseDaysAgo', { days: 0 })).toBe(today);
		expect(t('survey.impactMeasurement.lastResponseDaysAgo', { days: 1 })).toBe(yesterday);
		expect(t('survey.impactMeasurement.lastResponseDaysAgo', { days: 5 })).toBe(daysAgo);
	});

	it('falls back to English for namespaces a language does not translate', async () => {
		const messages = await loadMessages('kri');

		expect(messages['website-common']).toEqual((await loadMessages('en'))['website-common']);
		expect(messages['website-survey']).not.toEqual((await loadMessages('en'))['website-survey']);
	});
});

describe('pickClientMessages', () => {
	it('includes every namespace that client hooks read', async () => {
		const sourceFiles = readdirSync(srcDir, { recursive: true, encoding: 'utf8' }).filter((file) => /\.tsx?$/.test(file));
		const usedNamespaces = new Set(
			sourceFiles.flatMap((file) =>
				[...readFileSync(path.join(srcDir, file), 'utf8').matchAll(/useTranslations(?:<[^>]*>)?\('([\w-]+)'\)/g)].map(
					(match) => match[1],
				),
			),
		);

		expect(Object.keys(pickClientMessages(await loadMessages('en')))).toEqual(expect.arrayContaining([...usedNamespaces]));
	});
});
