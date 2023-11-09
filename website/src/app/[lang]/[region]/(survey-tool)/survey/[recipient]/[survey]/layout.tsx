import { DefaultParams } from '@/app/[lang]/[region]';
import { I18nDialog } from '@/components/i18n-dialog';
import { SILogo } from '@/components/logos/si-logo';
import { GlobeEuropeAfricaIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Button } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export interface SurveyPageProps {
	params: {
		recipient: string;
		survey: string;
	} & DefaultParams;
}

export default async function Layout({ children, params: { lang } }: PropsWithChildren<SurveyPageProps>) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});

	return (
		<div className="bg-muted min-h-screen">
			<nav className="bg-white">
				<BaseContainer className="flex h-16 items-center justify-between">
					<SILogo className="h-4" />
					<I18nDialog
						languages={[
							{ code: 'en', translation: 'English' },
							{ code: 'kri', translation: 'Krio' },
						]}
						regions={[{ code: 'int', translation: 'International' }]}
						currencies={[]}
						translations={{
							language: translator.t('language'),
							region: translator.t('region'),
							currency: translator.t('currency'),
						}}
					>
						<Button variant="ghost" className="flex max-w-md space-x-2">
							<LanguageIcon className="h-4 w-4" />
							<GlobeEuropeAfricaIcon className="h-4 w-4" />
						</Button>
					</I18nDialog>
				</BaseContainer>
			</nav>
			<main className="mx-auto max-w-5xl py-4">{children}</main>
		</div>
	);
}
