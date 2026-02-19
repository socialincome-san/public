'use client';

import { AccountMenu, Scope } from '@/components/app-shells/website/navbar/account-menu';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { MenuDesktop } from '@/components/app-shells/website/navbar/menu-desktop';
import { Button } from '@/components/button';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import Link from 'next/link';

type Props = {
  session: Session | null;
  menu: Layout['menu'];
  lang: WebsiteLanguage;
  region: string;
  scope: Scope;
};

export const NavbarDesktop = ({ session, menu, lang, region, scope }: Props) => (
  <nav className="container absolute inset-x-0 top-5 z-50 mx-auto flex h-14 items-center justify-between rounded-full bg-white p-2 shadow-[0_0_28px_rgba(0,0,0,0.05)]">
    <Link href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}`} className="ml-4 text-accent-foreground">
      <SocialIncomeLogo />
    </Link>

    <MenuDesktop nav={menu} lang={lang} region={region} />

    <div className="flex items-center gap-4">
      {!session && <LoginFlyout />}
      {session && <AccountMenu session={session} scope={scope} />}
      {!session && <Button className="h-11 rounded-full px-5 text-sm font-semibold">Donate now</Button>}
    </div>
  </nav>
);
