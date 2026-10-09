import { RootDocument, rootViewport } from '@/app/root-document';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { ReactNode } from 'react';

export const viewport = rootViewport;

export default function ApiDocsLayout({ children }: { children: ReactNode }) {
	return <RootDocument lang={defaultLanguage}>{children}</RootDocument>;
}
