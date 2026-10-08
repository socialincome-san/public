'use client';

import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { LoginFlyout as DesignSystemLoginFlyout } from '@socialincome/design-system/navigation/login-flyout/login-flyout';
import { useTranslations } from 'next-intl';

export const LoginFlyout = () => {
	const t = useTranslations('website-login');

	return (
		<DesignSystemLoginFlyout buttonLabel={t('flyout.login-button')} title={t('flyout.title')}>
			<MagicLinkLoginForm />
		</DesignSystemLoginFlyout>
	);
};
