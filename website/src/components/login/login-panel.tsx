'use client';

import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { AuthPanel, AuthPanelQuote } from '@socialincome/design-system/layout/auth-panel/auth-panel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export const LoginPanel = ({ children }: { children: ReactNode }) => {
	const t = useTranslations('website-login');
	const tCommon = useTranslations('website-common');
	const basePath = useWebsiteBasePath();

	return (
		<BlockWrapper marginTop="none" marginBottom="lg">
			<div className="mx-auto flex max-w-5xl flex-col gap-6 pt-9">
				<Breadcrumb
					layout="inline"
					links={[
						{ href: basePath, label: tCommon('breadcrumb.home') },
						{ href: `${basePath}/login`, label: t('nav-label') },
					]}
				/>
				<AuthPanel
					image={{ src: '/assets/sdg-town.jpg', alt: t('page.image-alt') }}
					caption={<AuthPanelQuote quote={t('page.quote')} author={t('page.quote-author')} />}
					footer={t.rich('page.support', {
						link: (chunks) => <a href="mailto:support@socialincome.org">{chunks}</a>,
					})}
				>
					{children}
				</AuthPanel>
			</div>
		</BlockWrapper>
	);
};
