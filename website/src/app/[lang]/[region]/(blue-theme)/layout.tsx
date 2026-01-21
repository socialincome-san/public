import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Navbar from '@/components/legacy/navbar/navbar';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { PropsWithChildren } from 'react';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang as WebsiteLanguage, 'website-donate');
}

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = (await params) as { lang: WebsiteLanguage; region: WebsiteRegion };

	return (
		<div className="theme-blue min-h-screen">
			<Navbar lang={lang} region={region} />
			<main className="pt-24 md:pt-36">{children}</main>
		</div>
	);
}
