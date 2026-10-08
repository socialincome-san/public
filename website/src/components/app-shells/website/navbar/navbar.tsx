import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { MenuMobile } from '@/components/app-shells/website/navbar/menu-mobile';
import { displaySession, toSiteMenuEntries, type Scope } from '@/components/app-shells/website/navbar/utils';
import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import type { Session } from '@/modules/auth/auth.types';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { SiteHeader } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';
import { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';

type Props = {
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export const Navbar = async ({ sessions, lang, region, scope }: Props) => {
	const session = displaySession(sessions, scope);
	const [t, tDonate, result] = await Promise.all([
		getTranslations('website-common'),
		getTranslations('website-donate'),
		getStoryWithFallbackAction<ISbStoryData<Layout>>({
			storyPath: STORYBLOK_LAYOUT_PATH,
			language: lang,
		}),
	]);
	const menuEntries = toSiteMenuEntries(result?.success ? result.data.content.menu : [], lang, region);

	return (
		<SiteHeader
			homeHref={`/${lang}/${region}`}
			homeLinkLabel={t('logo.home-link-aria')}
			desktopMenu={<SiteMenuDesktop entries={menuEntries} dropdownAside={<DonationFormServer />} />}
			localeSwitcher={scope === 'website' && <LocaleCurrencySwitcher lang={lang} region={region} />}
			account={session ? <AccountMenu sessions={sessions} scope={scope} /> : <LoginFlyout />}
			donateAction={!session && <OpenDonationWizardButton label={tDonate('donation-form.donate-now')} size="md" />}
			mobileMenu={<MenuMobile sessions={sessions} scope={scope} lang={lang} menuEntries={menuEntries} region={region} />}
		/>
	);
};
