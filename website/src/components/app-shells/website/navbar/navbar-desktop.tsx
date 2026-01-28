'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FlyoutPanel } from './flyout-panel';
import { LoginButton } from './login-button';
import { Logo } from './logo';
import { NavLinks } from './nav-links';
import { AccountMenu } from './account-menu';

export type NavItem = {
	label: string;
	href: string;
	sections?: {
		title: string;
		items: { label: string; href: string }[];
	}[];
};

type Props = {
	session?: ContributorSession | LocalPartnerSession;
	lang: WebsiteLanguage;
};

// todo: replace with data from storyblok
const NAV: NavItem[] = [
	{
		label: 'Link 1',
		href: '#',
		sections: [
			{
				title: 'Section 1',
				items: [
					{ label: 'Link 1.1', href: '#' },
					{ label: 'Link 1.2', href: '#' },
					{ label: 'Link 1.3', href: '#' },
				],
			},
			{
				title: 'Section 2',
				items: [
					{ label: 'Link 1.4', href: '#' },
					{ label: 'Link 1.5', href: '#' },
					{ label: 'Link 1.6', href: '#' },
				],
			},
			{
				title: 'Section 3',
				items: [
					{ label: 'Link 1.7', href: '#' },
					{ label: 'Link 1.8', href: '#' },
					{ label: 'Link 1.9', href: '#' },
				],
			},
		],
	},
	{
		label: 'Link 2',
		href: '#',
		sections: [
			{
				title: 'Section 1',
				items: [
					{ label: 'Link 2.1', href: '#' },
					{ label: 'Link 2.2', href: '#' },
					{ label: 'Link 2.3', href: '#' },
				],
			},
			{
				title: 'Section 2',
				items: [
					{ label: 'Link 2.1', href: '#' },
					{ label: 'Link 2.2', href: '#' },
					{ label: 'Link 2.3', href: '#' },
				],
			},
			{
				title: 'Section 3',
				items: [
					{ label: 'Link 2.7', href: '#' },
					{ label: 'Link 2.8', href: '#' },
					{ label: 'Link 2.9', href: '#' },
				],
			},
		],
	},
	{
		label: 'Link 3',
		href: '#',
	},
];

export const NavbarDesktop = ({ session, lang }: Props) => {
	const [open, setOpen] = useState<string | null>(null);
	const navRef = useRef<HTMLDivElement | null>(null);

	const activeItem = NAV.find((item) => item.label === open && item.sections);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!navRef.current) return;
			if (!navRef.current.contains(event.target as Node)) {
				setOpen(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

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

				<NavLinks nav={NAV} open={open} onClick={handleNavClick} />

				<div className="flex items-center gap-5">
					{!session && <LoginButton />}

					{session && (
						<AccountMenu session={session} />
					)}

					<Button className="rounded-full px-5 py-2 text-base font-medium">Donate now</Button>
				</div>
			</nav>

			<FlyoutPanel item={activeItem} onClose={() => setOpen(null)} />
		</div>
	);
};
