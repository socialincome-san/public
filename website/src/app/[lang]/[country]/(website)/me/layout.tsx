import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import { PropsWithChildren } from 'react';
import { LayoutTab } from './layout-tab';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: 'website-me' });
	const tabs = [
		{
			title: translator.t('tabs.contact-details'),
			href: `/${params.lang}/${params.country}/me/contact-details`,
		},
		{
			title: translator.t('tabs.payments'),
			href: `/${params.lang}/${params.country}/me/payments`,
		},
	];

	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			<div className="mb-8 flex flex-row">
				{tabs.map((tab, index) => (
					<LayoutTab key={index} title={tab.title} href={tab.href} />
				))}
			</div>
			{children}
		</BaseContainer>
	);
}
