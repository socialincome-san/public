import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Navbar from '@/components/navbar/navbar';
import { PropsWithChildren } from 'react';

export default function Layout({ children, params: { lang, region } }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<div className="theme-dark-blue min-h-screen">
			<Navbar lang={lang} region={region} showNavigation={false} />
			<main>{children}</main>
		</div>
	);
}
