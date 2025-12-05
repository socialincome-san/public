import { BaseContainer } from '@socialincome/ui';
import { ReactNode } from 'react';

type LayoutProps = {
	children: ReactNode;
	params: Promise<{
		lang: string;
		region: string;
		session: string;
	}>;
};

export default function Layout({ children }: LayoutProps) {
	return <BaseContainer className="pt-16">{children}</BaseContainer>;
}
