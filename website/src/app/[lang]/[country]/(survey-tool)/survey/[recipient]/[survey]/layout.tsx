import { DefaultPageProps } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { PropsWithChildren } from 'react';

export default function Layout({ children, params }: DefaultPageProps & PropsWithChildren) {
	return (
		<div className="min-h-screen bg-gray-100">
			<div className="navbar bg-white">
				<div className="navbar-start"></div>
				<div className="navbar-center">
					<SILogo className="h-4" />
				</div>
				<div className="navbar-end">
					<LanguageSwitcher params={params} languages={['en', 'kri']} />
				</div>
			</div>
			<main className="max-w-5xl mx-auto py-4">{children}</main>
		</div>
	);
}
