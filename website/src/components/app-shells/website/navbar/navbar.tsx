import { MenuDesktop } from '@/components/app-shells/website/navbar/menu-desktop';
import { MenuMobile } from '@/components/app-shells/website/navbar/menu-mobile';
import { AccountSlot, SignedOutSlot } from '@/components/app-shells/website/navbar/session-slots';
import { buildSiteMenuEntries } from '@/components/app-shells/website/navbar/site-menu';
import { type Scope } from '@/components/app-shells/website/navbar/utils';
import { VisitorLocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/visitor-locale-currency-switcher';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, WebsiteLanguage, type WebsiteCurrency } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import type { Session } from '@/modules/auth/auth.types';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { SiteHeader } from '@socialincome/design-system/navigation/site-header/site-header';
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
	const menuEntries = await buildSiteMenuEntries(result?.success ? result.data.content : undefined, lang, currency);

	return (
		<SiteHeader
			homeHref={getWebsiteBasePath(lang, currency)}
			homeLinkLabel={t('logo.home-link-aria')}
			desktopMenu={<MenuDesktop entries={menuEntries} />}
			localeSwitcher={scope === 'website' && <VisitorLocaleCurrencySwitcher lang={lang} currency={currency} variant="nav" />}
			account={<AccountSlot sessions={sessions} scope={scope} />}
			donateAction={
				<SignedOutSlot sessions={sessions} scope={scope}>
					<OpenDonationWizardButton
						label={tDonate('donation-form.donate-now')}
						size="md"
						analyticsEvent="donate_nav_click"
					/>
				</SignedOutSlot>
			}
			mobileMenu={
				<MenuMobile
					sessions={sessions}
					scope={scope}
					lang={lang}
					menuEntries={menuEntries}
					currency={currency}
					localeSwitcher={
						scope === 'website' && <VisitorLocaleCurrencySwitcher lang={lang} currency={currency} variant="outline" />
					}
				/>
			}
		/>
	);
};
