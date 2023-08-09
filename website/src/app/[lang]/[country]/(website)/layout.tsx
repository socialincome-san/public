import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import NavbarWrapper from '@/components/navbar/navbar-wrapper';
import { countries, websiteLanguages } from '@/i18n';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () =>
	countries.flatMap((country) => websiteLanguages.map((lang) => ({ lang, country })));

export default function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<div className="mx-auto">
			<NavbarWrapper params={params} />
			<main>{children}</main>
		</div>
	);
}
