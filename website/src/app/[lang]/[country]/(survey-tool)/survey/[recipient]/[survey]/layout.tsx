import { DefaultParams } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { PropsWithChildren, Suspense } from 'react';

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
					{/* Suspense is needed because of useSearchParams hook (https://nextjs.org/docs/messages/deopted-into-client-rendering)*/}
					<Suspense>
						<LanguageSwitcher params={params} languages={['en', 'kri']} />
					</Suspense>
				</div>
			</div>
			<main className="mx-auto max-w-5xl py-4">{children}</main>
		</div>
	);
}
