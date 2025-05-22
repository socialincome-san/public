import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { LayoutClient } from '@/app/[lang]/[region]/(website)/legal/layout-client';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';

export async function generateMetadata(props: DefaultLayoutProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-legal');
}

export default async function Layout({ children, ...props }: PropsWithChildren<DefaultLayoutProps>) {
	const params = await props.params;
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-legal' });

	return (
		<BaseContainer>
			<LayoutClient
				params={params}
				translations={{
					title: translator.t('title'),
					privacyTitle: translator.t('privacy-title'),
					termsOfUseTitle: translator.t('terms-of-use-title'),
					termsAndConditionsTitle: translator.t('terms-and-conditions-title'),
					fundraisersTitle: translator.t('fundraisers-title'),
				}}
			>
				{children}
			</LayoutClient>
		</BaseContainer>
	);
}
