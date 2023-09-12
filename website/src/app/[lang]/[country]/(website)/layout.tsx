import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { ThemeProvider } from '@/app/[lang]/[country]/(website)/theme-provider';
import Footer from '@/components/footer/footer';
import Navbar from '@/components/navbar/navbar';
import { countries, websiteLanguages, supportedWebsiteLanguages } from '@/i18n';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () =>
	countries.flatMap((country) => websiteLanguages.map((lang) => ({ lang, country })));

export default function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	return (
		<ThemeProvider>
			<div className="mx-auto">
				<Navbar lang={params.lang} country={params.country} supportedLanguages={supportedWebsiteLanguages}/>
				<main>{children}</main>
				<Footer params={params} supportedLanguages={supportedWebsiteLanguages} supportedCountries={countries}/>
			</div>
		</ThemeProvider>
	);
}
