'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import Link from 'next/link';
import { useLogout } from '../../use-logout';
import { Logo } from './logo';

export const NavbarMobile = ({ contributor, lang }: { contributor?: ContributorSession; lang: WebsiteLanguage }) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');

	const menuLinks = [{ href: '/', label: translator?.t('metadata.home-link') }];

	return (
		<nav className="container flex h-20 items-center justify-between">
			<Link href="/">
				<Logo />
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex h-12 items-center gap-2 rounded-full px-3">
						<Avatar>
							<AvatarFallback className="bg-primary text-background">
								{contributor?.firstName?.[0]}
								{contributor?.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-64">
					{menuLinks.map(({ href, label }) => (
						<DropdownMenuItem key={href} asChild>
							<Link href={href}>{label}</Link>
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
