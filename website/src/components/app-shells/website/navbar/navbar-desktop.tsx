'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ContributorSession } from '@/lib/services/contributor/contributor.types';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useLogout } from '../../use-logout';
import { Logo } from './logo';

export const NavbarDesktop = ({ contributor, lang }: { contributor?: ContributorSession; lang: WebsiteLanguage }) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');

	const mainLinks = [{ href: '/', label: translator?.t('metadata.home-link') }];

	const userMenuLinks = [
		{
			href: '/dashboard/profile',
			label: translator?.t('profile.link') ?? 'Profile',
		},
	];

	return (
		<nav className="container mt-6 flex h-20 items-center justify-between rounded-full bg-white">
			<Link href="/">
				<Logo />
			</Link>

			{/* MAIN NAV LINKS */}
			<div className="flex items-center gap-x-4">
				<nav className="flex items-center gap-4">
					{mainLinks.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className={twMerge(
								'text-primary hover:bg-accent relative rounded-md px-3 py-2 text-lg font-medium transition-colors duration-200',
							)}
						>
							{label}
						</Link>
					))}
				</nav>
			</div>

			{/* USER MENU */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex h-12 items-center gap-2 rounded-full px-3">
						<Avatar>
							<AvatarFallback className="bg-primary text-background">
								{contributor?.firstName?.[0]}
								{contributor?.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div className="text-left">
							<p className="text-sm font-medium">
								{contributor?.firstName} {contributor?.lastName}
							</p>
							<p className="text-muted-foreground text-xs">Contributor</p>
						</div>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-64">
					{userMenuLinks.map(({ href, label }) => (
						<DropdownMenuItem key={href} asChild>
							<Link href={href} className="cursor-pointer">
								{label}
							</Link>
						</DropdownMenuItem>
					))}

					<DropdownMenuItem
						onSelect={(e: Event) => {
							e.preventDefault();
							logout();
						}}
						className="text-destructive focus:text-destructive"
					>
						<span>{translator?.t('security.sign-out.button')}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
};
