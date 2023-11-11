import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { LayoutClient } from '@/app/[lang]/[region]/(website)/me/layout-client';
import { UserContextProvider } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-me' });

	return (
		<BaseContainer backgroundColor="bg-blue-50" className="min-h-screen">
			<UserContextProvider>
				<LayoutClient
					params={params}
					translations={{
						accountTitle: translator.t('sections.account.title'),
						personalInfo: translator.t('sections.account.personal-info'),
						security: translator.t('sections.account.security'),
						contributionsTitle: translator.t('sections.contributions.title'),
						payments: translator.t('sections.contributions.payments'),
						subscriptions: translator.t('sections.contributions.subscriptions'),
					}}
				>
					{children}
				</LayoutClient>
			</UserContextProvider>
		</BaseContainer>
	);
}
