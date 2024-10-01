import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<DefaultLayoutProps>) {
	return <BaseContainer className="pt-16">{children}</BaseContainer>;
}
