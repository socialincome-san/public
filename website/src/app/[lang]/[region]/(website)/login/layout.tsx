import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export default async function Layout({ children }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="min-h-screen">{children}</BaseContainer>;
}
