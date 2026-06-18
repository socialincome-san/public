import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { LocaleCurrencySwitcher } from '@/components/app-shells/website/navbar/locale-currency-switcher';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { MenuDesktop } from '@/components/app-shells/website/navbar/menu-desktop';
import { MenuMobile } from '@/components/app-shells/website/navbar/menu-mobile';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Session } from '@/lib/firebase/current-account';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { cn } from '@/lib/utils/cn';
import { ISbStoryData } from '@storyblok/js';
import NextLink from 'next/link';

type Props = {
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export const Navbar = async ({ sessions, lang, region, scope }: Props) => {
	const session = displaySession(sessions, scope);
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-donate'] });
	const result = await services.storyblok.getStoryWithFallback<ISbStoryData<Layout>>(STORYBLOK_LAYOUT_PATH, lang);
	const menu = result?.success ? result.data.content.menu : [];

	return (
		<nav
			className={cn(
				'max-w-content static inset-x-0 top-5 z-50 mx-auto flex h-18 w-full items-center justify-between bg-white px-4 py-2',
				'lg:w-site-width lg:absolute lg:top-5 lg:h-14 lg:rounded-full lg:px-2 lg:shadow-[0_0_28px_rgba(0,0,0,0.05)]',
			)}
		>
			<NextLink href={`/${lang}/${region}`} className="text-accent-foreground lg:ml-4">
				<SocialIncomeLogo />
			</NextLink>

			<div className="hidden lg:block">
				<MenuDesktop menu={menu} lang={lang} region={region} />
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden lg:block">
					<LocaleCurrencySwitcher lang={lang} region={region} />
				</div>
				<div className="hidden lg:block">
					{session ? <AccountMenu sessions={sessions} scope={scope} lang={lang} /> : <LoginFlyout lang={lang} />}
				</div>
				{!session && (
					<OpenDonationWizardButton
						label={translator.t('donation-form.donate-now')}
						className="rounded-full px-5 text-sm font-semibold lg:h-11"
					/>
				)}
				<MenuMobile sessions={sessions} scope={scope} lang={lang} menu={menu} region={region} />
			</div>
		</nav>
	);
};
