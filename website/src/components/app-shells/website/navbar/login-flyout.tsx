'use client';

import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { useTranslator } from '@/lib/i18n/use-translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { LoginFlyout as DesignSystemLoginFlyout } from '@socialincome/design-system/navigation/login-flyout/login-flyout';

type Props = {
	lang: WebsiteLanguage;
};

export const LoginFlyout = ({ lang }: Props) => {
	const translator = useTranslator(lang, 'website-login');

	return (
		<DesignSystemLoginFlyout buttonLabel={translator?.t('flyout.login-button')} title={translator?.t('flyout.title')}>
			<MagicLinkLoginForm lang={lang} />
		</DesignSystemLoginFlyout>
	);
};
