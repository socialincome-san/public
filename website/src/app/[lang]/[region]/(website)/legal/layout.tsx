import { LayoutClient } from '@/app/[lang]/[region]/(website)/legal/layout-client';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '@/app/[lang]/[region]';

export async function generateMetadata({ params }: DefaultLayoutProps) {
	return getMetadata(params.lang, 'website-legal');
}

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-legal' });

	return (
		<BaseContainer className="pb-8">
				<LayoutClient
					params={params}
					translations={{
						privacyTitle: translator.t('privacy-title'),
						termsOfUseTitle: translator.t('terms-of-use-title'),
						termsAndConditionsTitle: translator.t('terms-and-conditions-title'),
						fundraisersTitle: translator.t('fundraisers-title')
					}}
				>
					{children}
				</LayoutClient>
		</BaseContainer>
	);
}
