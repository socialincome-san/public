import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="bg-base-blue min-h-screen">{children}</BaseContainer>;
}
