import { AuthPanel, AuthPanelQuote } from '@socialincome/design-system/layout/auth-panel/auth-panel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export const LoginPanel = ({ children }: { children: ReactNode }) => {
	const t = useTranslations('website-login');

	return (
		<BlockWrapper marginTop="md" marginBottom="lg">
			<div className="mx-auto max-w-5xl">
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
