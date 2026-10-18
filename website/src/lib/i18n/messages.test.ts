import { createTranslator } from 'next-intl';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { loadMessages, pickClientMessages, pickPortalClientMessages } from './messages';
import { mainWebsiteLanguages } from './utils';

const srcDir = path.join(__dirname, '../..');
const localesDir = path.join(srcDir, 'lib/i18n/locales');

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const messageKeys = (value: unknown, parent = ''): string[] =>
	isRecord(value)
		? Object.entries(value).flatMap(([key, child]) =>
				typeof child === 'string' ? [`${parent}${key}`] : messageKeys(child, `${parent}${key}.`),
			)
		: [];

const readMessages = (language: string, namespace: string): unknown => {
	const messages: unknown = JSON.parse(readFileSync(path.join(localesDir, language, `${namespace}.json`), 'utf8'));

	return messages;
};

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
	const sourceFiles = readdirSync(srcDir, { recursive: true, encoding: 'utf8' }).filter((file) => /\.tsx?$/.test(file));
	const usedNamespaces = (files: string[]) =>
		new Set(
			files.flatMap((file) =>
				[...readFileSync(path.join(srcDir, file), 'utf8').matchAll(/useTranslations(?:<[^>]*>)?\('([\w-]+)'\)/g)].map(
					(match) => match[1],
				),
			),
		);

	it('includes every namespace that client hooks read', async () => {
		const used = usedNamespaces(sourceFiles);
		const messages = await loadMessages('en');
		const availableNamespaces = [
			...Object.keys(pickClientMessages(messages)),
			...Object.keys(pickPortalClientMessages(messages)),
		];

		expect(availableNamespaces).toEqual(expect.arrayContaining([...used]));
	});

	it('keeps portal-only messages out of the public-site client payload', async () => {
		const portalClientFiles = sourceFiles.filter(
			(file) =>
				file.startsWith('app/portal/') ||
				file.startsWith('components/app-shells/portal/') ||
				file.startsWith('components/data-table/') ||
				file.startsWith('components/dynamic-form/') ||
				file.startsWith('components/create-program-wizard/') ||
				file === 'components/tab-navigation.tsx' ||
				file === 'components/portal-shared-translations.tsx',
		);
		const portalNamespaces = [...usedNamespaces(portalClientFiles)];
		const messages = await loadMessages('en');
		const portalClientMessages = pickPortalClientMessages(messages);

		expect(Object.keys(portalClientMessages)).toEqual(expect.arrayContaining(portalNamespaces));
		expect(Object.keys(pickClientMessages(messages))).not.toContain('portal-admin');
	});
});

describe('portal locale files', () => {
	it('keep every portal namespace key in sync across the four supported languages', () => {
		const portalNamespaces = readdirSync(path.join(localesDir, 'en'))
			.filter((file) => /^portal-.+\.json$/.test(file))
			.map((file) => file.replace(/\.json$/, ''));

		expect(portalNamespaces.length).toBeGreaterThan(0);

		for (const namespace of portalNamespaces) {
			const englishKeys = messageKeys(readMessages('en', namespace));

			for (const language of mainWebsiteLanguages.filter((entry) => entry !== 'en')) {
				expect(messageKeys(readMessages(language, namespace))).toEqual(englishKeys);
			}
		}
	});
});
