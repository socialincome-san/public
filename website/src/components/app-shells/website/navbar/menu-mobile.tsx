'use client';

import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { AccountSlot, SignedOutSlot } from '@/components/app-shells/website/navbar/session-slots';
import { type Scope } from '@/components/app-shells/website/navbar/utils';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { getWebsiteBasePath, WebsiteLanguage, type WebsiteCurrency } from '@/lib/i18n/utils';
import type { Session } from '@/modules/auth/auth.types';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuMobile } from '@socialincome/design-system/navigation/site-header/site-menu-mobile';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Fragment, Suspense, type ReactNode } from 'react';

type Props = {
	sessions: Promise<Session[]>;
	scope: Scope;
	menuEntries: SiteMenuEntry[];
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

const KeyedByPathname = ({ children }: { children: ReactNode }) => <Fragment key={usePathname()}>{children}</Fragment>;

export const MenuMobile = ({ sessions, scope, menuEntries, lang, currency }: Props) => {
	const t = useTranslations('website-common');
	const tDonate = useTranslations('website-donate');
	const menu = (
		<SiteMenuMobile
			entries={menuEntries}
			homeHref={getWebsiteBasePath(lang, currency)}
			labels={{
				openMenu: t('menu.open'),
				closeMenu: t('menu.close'),
				title: t('menu.title'),
				back: t('menu.back'),
				homeLink: t('logo.home-link-aria'),
			}}
			renderDonateAction={(closeMenu) => (
				<SignedOutSlot sessions={sessions} scope={scope}>
					<OpenDonationWizardButton label={tDonate('donation-form.donate-now')} size="md" onBeforeOpen={closeMenu} />
				</SignedOutSlot>
			)}
			footerControls={
				<>
					{scope === 'website' && <LocaleCurrencySwitcher lang={lang} currency={currency} variant="outline" />}
					<AccountSlot sessions={sessions} scope={scope} />
				</>
			}
		/>
	);

	// Remounts the menu on navigation so it closes. The pathname is unknown while prerendering dynamic routes, so the
	// static shell renders the menu without the key.
	return (
		<Suspense fallback={menu}>
			<KeyedByPathname>{menu}</KeyedByPathname>
		</Suspense>
	);
};
