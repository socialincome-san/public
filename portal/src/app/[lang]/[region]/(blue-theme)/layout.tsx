import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import Navbar from '@/components/navbar/navbar';
import { getMetadata } from '@/metadata';
import { PropsWithChildren } from 'react';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-donate');
}

export default async function Layout(props: PropsWithChildren<DefaultLayoutProps>) {
	const params = await props.params;

	const { lang, region } = params;

	const { children } = props;

	return (
		<div className="theme-blue min-h-screen">
			<Navbar lang={lang} region={region} />
			<main className="pt-24 md:pt-36">{children}</main>
		</div>
	);
}
