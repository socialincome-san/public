import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });
	return getMetadata(params.lang, 'website-me', { title: translator.t('login.metadata.title') });
}

export default async function Layout({ children }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="min-h-screen">{children}</BaseContainer>;
}
