import { DefaultParams } from '@/app/[lang]/[country]';
import { SILogo } from '@/components/logos/si-logo';
import { PropsWithChildren } from 'react';
import { LanguageSwitcher } from './language-switcher';

export interface SurveyPageProps {
	params: {
		recipient: string;
		survey: string;
	} & DefaultParams;
}

export default function Layout({ children, params }: PropsWithChildren<SurveyPageProps>) {
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
			<main className="mx-auto max-w-5xl py-4">{children}</main>
		</div>
	);
}
