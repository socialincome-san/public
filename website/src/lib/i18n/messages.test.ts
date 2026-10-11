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
