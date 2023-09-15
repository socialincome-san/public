import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="min-h-screen">{children}</BaseContainer>;
}
