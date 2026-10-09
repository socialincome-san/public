import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { MenuMobile } from '@/components/app-shells/website/navbar/menu-mobile';
import { AccountSlot, SignedOutSlot } from '@/components/app-shells/website/navbar/session-slots';
import { toSiteMenuEntries, type Scope } from '@/components/app-shells/website/navbar/utils';
import { DonationForm } from '@/components/donation-wizard/donation-form';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, WebsiteLanguage, type WebsiteCurrency } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import type { Session } from '@/modules/auth/auth.types';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { SiteHeader } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';
import { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';

type Props = {
	sessions: Promise<Session[]>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	scope: Scope;
};

export const Navbar = async ({ sessions, lang, currency, scope }: Props) => {
	const [t, tDonate, result] = await Promise.all([
		getTranslations('website-common'),
		getTranslations('website-donate'),
		getStoryWithFallbackAction<ISbStoryData<Layout>>({
			storyPath: STORYBLOK_LAYOUT_PATH,
			language: lang,
		}),
	]);
	const menuEntries = toSiteMenuEntries(result?.success ? result.data.content.menu : [], lang, currency);

	return (
		<SiteHeader
			homeHref={getWebsiteBasePath(lang, currency)}
			homeLinkLabel={t('logo.home-link-aria')}
			desktopMenu={<SiteMenuDesktop entries={menuEntries} dropdownAside={<DonationForm />} />}
			localeSwitcher={scope === 'website' && <LocaleCurrencySwitcher lang={lang} currency={currency} />}
			account={<AccountSlot sessions={sessions} scope={scope} />}
			donateAction={
				<SignedOutSlot sessions={sessions} scope={scope}>
					<OpenDonationWizardButton label={tDonate('donation-form.donate-now')} size="md" />
				</SignedOutSlot>
			}
			mobileMenu={<MenuMobile sessions={sessions} scope={scope} lang={lang} menuEntries={menuEntries} currency={currency} />}
		/>
	);
};
