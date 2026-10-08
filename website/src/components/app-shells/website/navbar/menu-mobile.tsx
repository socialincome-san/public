'use client';

import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { AccountSlot, SignedOutSlot } from '@/components/app-shells/website/navbar/session-slots';
import { type Scope } from '@/components/app-shells/website/navbar/utils';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Session } from '@/modules/auth/auth.types';
import { type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuMobile } from '@socialincome/design-system/navigation/site-header/site-menu-mobile';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

type Props = {
	sessions: Promise<Session[]>;
	scope: Scope;
	menuEntries: SiteMenuEntry[];
	lang: WebsiteLanguage;
	region: string;
};

export const MenuMobile = ({ sessions, scope, menuEntries, lang, region }: Props) => {
	const t = useTranslations('website-common');
	const tDonate = useTranslations('website-donate');
	const pathname = usePathname();

	return (
		<SiteMenuMobile
			key={pathname}
			entries={menuEntries}
			homeHref={`/${lang}/${region}`}
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
					{scope === 'website' && <LocaleCurrencySwitcher lang={lang} region={region} variant="outline" />}
					<AccountSlot sessions={sessions} scope={scope} />
				</>
			}
		/>
	);
};
