'use client';

import { Button } from '@/components/button';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { NavItem } from '@/lib/services/storyblok/storyblok.types';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useClickOutside } from '../../use-click-outside';
import { AccountMenu } from './account-menu';
import { FlyoutPanel } from './flyout-panel';
import { LoginFlyout } from './login-flyout';
import { Logo } from './logo';
import { NavLinks } from './nav-links';

type Props = {
	session?: ContributorSession | LocalPartnerSession;
	lang: WebsiteLanguage;
	navItems: NavItem[];
};

export const NavbarDesktop = ({ session, lang, navItems }: Props) => {
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
					<Logo />
				</Link>

				<NavLinks nav={navItems} open={open} onClick={handleNavClick} />

				<div className="flex items-center gap-5">
					{!session && <LoginFlyout />}

					{session && <AccountMenu session={session} />}

					{!session && <Button className="rounded-full px-5 py-2 text-base font-medium">Donate now</Button>}
				</div>
			</nav>

			<FlyoutPanel item={activeItem} onClose={() => setOpen(null)} />
		</div>
	);
};
