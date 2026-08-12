import { RootDocument } from '@/app/root-document';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';

export default function StorybookLayout({ children }: PropsWithChildren) {
	return <RootDocument lang={defaultLanguage}>{children}</RootDocument>;
}
