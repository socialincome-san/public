import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Footer from '@/components/footer/footer';
import Navbar from '@/components/navbar/navbar';
import { websiteLanguages, websiteRegions } from '@/i18n';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () =>
	websiteRegions.flatMap((country) => websiteLanguages.map((lang) => ({ lang, country })));

export default function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<div className="mx-auto flex flex-col">
			<Navbar lang={params.lang} region={params.region} />
			<main className="min-h-screen-navbar flex-1">{children}</main>
			<Footer lang={params.lang} region={params.region} />
		</div>
	);
}
