'use client';

import { useClickOutside } from '@/components/app-shells/use-click-outside';
import { AccountMenu, Scope } from '@/components/app-shells/website/navbar/account-menu';
import { FlyoutPanel } from '@/components/app-shells/website/navbar/flyout-panel';
import { LoginFlyout } from '@/components/app-shells/website/navbar/login-flyout';
import { NavLinks } from '@/components/app-shells/website/navbar/nav-links';
import { Button } from '@/components/button';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NavItem } from '@/lib/services/storyblok/storyblok.types';
import Link from 'next/link';
import { useRef, useState } from 'react';

type Props = {
	session: Session | null;
	lang: WebsiteLanguage;
	navItems: NavItem[];
	scope: Scope;
};

export const NavbarDesktop = ({ session, lang, navItems, scope }: Props) => {
	const [open, setOpen] = useState<string | null>(null);
	const navRef = useRef<HTMLDivElement | null>(null);

	useClickOutside(navRef, () => setOpen(null));

	const activeItem = navItems.find((item) => item.label === open && item.sections);

	const handleNavClick = (item: NavItem) => {
		if (!item.sections) {
			setOpen(null);
			return;
		}
		setOpen((prev) => (prev === item.label ? null : item.label));
	};

	return (
		<div ref={navRef} className="relative z-50 w-full">
			<nav className="container mt-6 flex items-center justify-between rounded-full bg-white px-8 py-3 shadow-sm">
				<Link href="/">
					<SocialIncomeLogo />
				</Link>

				<NavLinks nav={navItems} open={open} onClick={handleNavClick} />

				<div className="flex items-center gap-5">
					{!session && <LoginFlyout />}

					{session && <AccountMenu session={session} scope={scope} />}

					{!session && <Button className="rounded-full px-5 py-2 text-base font-medium">Donate now</Button>}
				</div>
			</nav>

			<FlyoutPanel item={activeItem} onClose={() => setOpen(null)} />
		</div>
	);
};
