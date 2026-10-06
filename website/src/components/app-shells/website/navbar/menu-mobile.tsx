'use client';

import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { useTranslator } from '@/lib/i18n/use-translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Session } from '@/modules/auth/auth.types';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuMobile } from '@socialincome/design-system/navigation/site-header/site-menu-mobile';
import { usePathname } from 'next/navigation';

type Props = {
	sessions: Session[];
	scope: Scope;
	menuEntries: SiteMenuEntry[];
	lang: WebsiteLanguage;
	region: string;
};

export const MenuMobile = ({ sessions, scope, menuEntries, lang, region }: Props) => {
	const session = displaySession(sessions, scope);
	const commonTranslator = useTranslator(lang, 'website-common');
	const donateTranslator = useTranslator(lang, 'website-donate');
	const pathname = usePathname();

	return (
		<SiteMenuMobile
			key={pathname}
			entries={menuEntries}
			homeHref={`/${lang}/${region}`}
			labels={{
				openMenu: commonTranslator?.t('menu.open') ?? 'Open menu',
				closeMenu: commonTranslator?.t('menu.close') ?? 'Close menu',
				title: commonTranslator?.t('menu.title') ?? 'Menu',
				back: commonTranslator?.t('menu.back') ?? 'Back',
				homeLink: commonTranslator?.t('logo.home-link-aria') ?? 'Social Income home',
			}}
			renderDonateAction={
				session
					? undefined
					: (closeMenu) => (
							<OpenDonationWizardButton
								label={donateTranslator?.t('donation-form.donate-now') ?? 'Donate now'}
								size="md"
								onBeforeOpen={closeMenu}
							/>
						)
			}
			footerControls={
				<>
					{scope === 'website' && <LocaleCurrencySwitcher lang={lang} region={region} variant="outline" />}
					{session ? <AccountMenu sessions={sessions} scope={scope} lang={lang} /> : <LoginFlyout lang={lang} />}
				</>
			}
		/>
	);
};
