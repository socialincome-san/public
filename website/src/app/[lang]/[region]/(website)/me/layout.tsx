import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { LayoutClient } from '@/app/[lang]/[region]/(website)/me/layout-client';
import { UserContextProvider } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-me');
}

export default async function Layout({ children, ...props }: PropsWithChildren<DefaultLayoutProps>) {
	const params = await props.params;
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-me' });

	return (
		<BaseContainer>
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
						donationCertificatesShort: translator.t('sections.contributions.donation-certificates-short'),
						donationCertificatesLong: translator.t('sections.contributions.donation-certificates-long'),
					}}
				>
					{children}
				</LayoutClient>
			</UserContextProvider>
		</BaseContainer>
	);
}
