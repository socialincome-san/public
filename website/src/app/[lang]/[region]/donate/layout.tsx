import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Navbar from '@/components/navbar/navbar';
import { PropsWithChildren } from 'react';

export default function Layout({ children, params: { lang, region } }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<div>
			<Navbar lang={lang} region={region} showNavigation={false} />
			<main>{children}</main>
		</div>
	);
}
