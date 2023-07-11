import { DefaultPageProps } from '@/app/[lang]/[country]';
import Navbar from '@/components/navbar/navbar';
import { countries, websiteLanguages } from '@/i18n';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () =>
	countries.flatMap((country) => websiteLanguages.map((lang) => ({ lang, country })));

export default function Layout({ children, params }: PropsWithChildren<DefaultPageProps>) {
	return (
		<div className="mx-auto">
			<Navbar params={params} />
			<main>{children}</main>
		</div>
	);
}
