import type { Translator } from '@/lib/i18n/translator';

export const columnLabel = (
	localizeLabels: boolean,
	translator: Translator | undefined,
	key: string,
	fallback: string,
): string => (localizeLabels && translator ? translator.t(`program-detail-page.${key}`) : fallback);
