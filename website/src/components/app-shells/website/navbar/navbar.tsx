import { DonateNavButton } from '@/components/app-shells/website/navbar/donate-nav-button';
import { MenuMobile } from '@/components/app-shells/website/navbar/menu-mobile';
import { AccountSlot, SignedOutSlot } from '@/components/app-shells/website/navbar/session-slots';
import { getSiteMenuEntries } from '@/components/app-shells/website/navbar/site-menu';
import { type Scope } from '@/components/app-shells/website/navbar/utils';
import { VisitorLocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/visitor-locale-currency-switcher';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, WebsiteLanguage, type WebsiteCurrency } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
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
	const layout = result?.success ? result.data.content : undefined;
	const menuEntries = await getSiteMenuEntries(layout, lang, currency);
	const donateLink = resolveStoryblokLink(layout?.donateLink, lang, currency);
	const donateHref = donateLink === '#' ? undefined : donateLink;

	return (
		<SiteHeader
			homeHref={getWebsiteBasePath(lang, currency)}
			homeLinkLabel={t('logo.home-link-aria')}
			desktopMenu={<SiteMenuDesktop entries={menuEntries} />}
			localeSwitcher={scope === 'website' && <VisitorLocaleCurrencySwitcher lang={lang} currency={currency} />}
			account={<AccountSlot sessions={sessions} scope={scope} />}
			donateAction={
				<SignedOutSlot sessions={sessions} scope={scope}>
					<DonateNavButton label={tDonate('donation-form.donate-now')} href={donateHref} />
				</SignedOutSlot>
			}
			mobileMenu={
				<MenuMobile
					sessions={sessions}
					scope={scope}
					lang={lang}
					menuEntries={menuEntries}
					donateHref={donateHref}
					currency={currency}
					localeSwitcher={
						scope === 'website' && <VisitorLocaleCurrencySwitcher lang={lang} currency={currency} variant="outline" />
					}
				/>
			}
		/>
	);
};
