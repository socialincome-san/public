import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Footer from '@/components/footer/footer';
import Navbar from '@/components/navbar/navbar';
import { PropsWithChildren } from 'react';

export default async function Layout(props: PropsWithChildren<DefaultLayoutProps>) {
	const params = await props.params;

	const { lang, region } = params;

	const { children } = props;

	return (
		<div className="theme-default [&:has(.hero-video)_nav]:bg-transparent">
			<Navbar lang={lang} region={region} />
			<main className="min-h-screen-navbar mt-16 py-8 md:mt-20 md:py-16 [&:has(.blog)]:py-0">{children}</main>
			<Footer lang={lang} region={region} />
		</div>
	);
}
