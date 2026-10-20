import de from '@/lib/i18n/locales/de/portal-admin.json';
import en from '@/lib/i18n/locales/en/portal-admin.json';
import fr from '@/lib/i18n/locales/fr/portal-admin.json';
import italianMessages from '@/lib/i18n/locales/it/portal-admin.json';
import { createTranslator } from 'next-intl';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const flattenKeys = (value: unknown, prefix = ''): string[] => {
	if (!isRecord(value)) {
		return [];
	}

	return Object.entries(value).flatMap(([key, child]) => {
		const path = prefix ? `${prefix}.${key}` : key;

		return isRecord(child) ? flattenKeys(child, path) : [path];
	});
};

describe('portal admin translations', () => {
	it('keeps the four supported locale files in key parity', () => {
		const englishKeys = flattenKeys(en).sort();

		for (const messages of [de, fr, italianMessages]) {
			expect(flattenKeys(messages).sort()).toEqual(englishKeys);
		}
	});

	it.each([
		['en', en],
		['de', de],
		['fr', fr],
		['it', italianMessages],
	] as const)('formats ICU messages in %s', (locale, messages) => {
		const t = createTranslator({ locale, messages, namespace: 'csv' });

		expect(t('success', { count: 2 })).not.toContain('{count');
		expect(t('success', { count: 2 })).not.toContain('{error');
	});
});
