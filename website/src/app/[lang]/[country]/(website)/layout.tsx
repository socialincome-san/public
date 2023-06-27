import { DefaultPageProps } from '@/app/[lang]/[country]';
import Navbar from '@/components/navbar/navbar';
import { countries, languages } from '@/i18n';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () => countries.flatMap((country) => languages.map((lang) => ({ lang, country })));

export default function Layout({ children, params }: DefaultPageProps & PropsWithChildren) {
	return (
		<div className="max-w-7xl mx-auto">
			<Navbar params={params} />
			<main>{children}</main>
		</div>
	);
}
