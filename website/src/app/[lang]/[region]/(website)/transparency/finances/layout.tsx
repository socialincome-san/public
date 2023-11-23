import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	return getMetadata(params.lang, 'website-finances');
}

export default function Layout({ children }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="min-h-screen">{children}</BaseContainer>;
}
