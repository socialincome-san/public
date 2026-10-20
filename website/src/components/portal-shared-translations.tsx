'use client';

import type { Messages } from '@/lib/i18n/messages';
import { useTranslations } from 'next-intl';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';

type TranslationKey = Exclude<keyof Messages['portal-shared'], 'csv'>;
type SharedTranslations = {
	isPortal: boolean;
	t: (key: TranslationKey, fallback: string) => string;
	tImportedMany: (count: number) => string;
};
export type PortalSharedTranslate = SharedTranslations['t'];

const PortalSharedTranslationsContext = createContext<SharedTranslations | null>(null);

export const PortalSharedTranslationsProvider = ({ children }: { children: ReactNode }) => {
	const translate = useTranslations('portal-shared');
	const t = useCallback<SharedTranslations['t']>((key) => translate(key), [translate]);
	const tImportedMany = useCallback((count: number) => translate('csv.importedMany', { count }), [translate]);
	const value = useMemo(() => ({ isPortal: true, t, tImportedMany }), [t, tImportedMany]);

	return <PortalSharedTranslationsContext.Provider value={value}>{children}</PortalSharedTranslationsContext.Provider>;
};

const fallbackTranslations: SharedTranslations = {
	isPortal: false,
	t: (_key, fallback) => fallback,
	tImportedMany: (count) => `Successfully imported ${count} items.`,
};

export const usePortalSharedTranslations = () => useContext(PortalSharedTranslationsContext) ?? fallbackTranslations;
