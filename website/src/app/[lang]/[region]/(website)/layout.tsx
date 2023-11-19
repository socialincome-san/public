import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Footer from '@/components/footer/footer';
import Navbar from '@/components/navbar/navbar';
import { PropsWithChildren } from 'react';

export default function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<div className="mx-auto flex flex-col">
			<Navbar lang={params.lang} region={params.region} />
			<main className="min-h-screen-navbar flex-1">{children}</main>
			<Footer lang={params.lang} region={params.region} />
		</div>
	);
}
