import { AccountMenu } from '@/components/app-shells/website/navbar/account-menu';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/display-session';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { MenuDesktop } from '@/components/app-shells/website/navbar/menu-desktop';
import { MobileMenu } from '@/components/app-shells/website/navbar/mobile-menu';
import { Button } from '@/components/button';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { cn } from '@/lib/utils/cn';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ISbStoryData } from '@storyblok/js';
import NextLink from 'next/link';

const storyblokService = new StoryblokService();

type Props = {
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export const Navbar = async ({ sessions, lang, region, scope }: Props) => {
	const session = displaySession(sessions, scope);
	const result = await storyblokService.getStoryWithFallback<ISbStoryData<Layout>>(`${NEW_WEBSITE_SLUG}/layout`, lang);
	const menu = result.success ? result.data.content.menu : [];

	return (
		<nav
			className={cn(
				'max-w-content static inset-x-0 top-5 z-50 mx-auto flex h-18 w-full items-center justify-between bg-white px-4 py-2',
				'lg:w-site-width lg:absolute lg:top-5 lg:h-14 lg:rounded-full lg:px-2 lg:shadow-[0_0_28px_rgba(0,0,0,0.05)]',
			)}
		>
			<NextLink href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}`} className="text-accent-foreground lg:ml-4">
				<SocialIncomeLogo />
			</NextLink>

			<div className="hidden lg:block">
				<MenuDesktop nav={menu} lang={lang} region={region} />
			</div>

			<div className="flex items-center gap-4">
				{!session && (
					<span className="hidden lg:block">
						<LoginFlyout />
					</span>
				)}
				{session && (
					<span className="hidden lg:block">
						<AccountMenu sessions={sessions} scope={scope} />
					</span>
				)}
				{!session && (
					<Button className="hidden rounded-full px-5 text-sm font-semibold lg:block lg:h-11">Donate now</Button>
				)}
				<MobileMenu menu={menu} lang={lang} region={region} />
			</div>
		</nav>
	);
};
