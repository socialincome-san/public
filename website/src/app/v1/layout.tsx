import { RootDocument, rootViewport } from '@/app/root-document';
import { defaultLanguage } from '@/lib/i18n/utils';
import { languageNeutralImages } from '@/lib/utils/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const viewport = rootViewport;

export const metadata: Metadata = { title: 'Social Income', ...languageNeutralImages };

export default function ApiDocsLayout({ children }: { children: ReactNode }) {
	return <RootDocument lang={defaultLanguage}>{children}</RootDocument>;
}
