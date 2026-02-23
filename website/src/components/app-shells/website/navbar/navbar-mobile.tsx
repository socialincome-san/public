'use client';

import { useLogout } from '@/components/app-shells/use-logout';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/display-session';
import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import type { Session } from '@/lib/firebase/current-account';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import Link from 'next/link';

type Props = {
	lang: WebsiteLanguage;
	scope: Scope;
	sessions: Session[];
};

export const NavbarMobile = ({ lang, scope, sessions }: Props) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');
	const session = displaySession(sessions, scope);
	const hasUser = sessions.some((s) => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const hasLocalPartner = sessions.some((s) => s.type === 'local-partner');
	const menuLinks: { href: string; label: string }[] = [
		{ href: '/', label: translator?.t('metadata.home-link') ?? 'Home' },
	];

	if (scope === 'website') {
		if (hasUser) {
			menuLinks.push({ href: '/portal', label: 'Go to portal' });
		}
		if (hasContributor) {
			menuLinks.push({ href: '/dashboard/contributions', label: 'Go to dashboard' });
		}
		if (hasLocalPartner) {
			menuLinks.push({ href: '/partner-space/recipients', label: 'Go to partner space' });
		}
	} else {
		menuLinks.push({
			href: scope === 'partner-space' ? '/partner-space/profile' : '/dashboard/profile',
			label: translator?.t('profile.link') ?? 'Profile',
		});
		if (hasUser) {
			menuLinks.push({ href: '/portal', label: 'Go to portal' });
		}
		if (scope === 'partner-space' && hasContributor) {
			menuLinks.push({ href: '/dashboard/contributions', label: 'Go to dashboard' });
		}
		if (scope === 'dashboard' && hasLocalPartner) {
			menuLinks.push({ href: '/partner-space/recipients', label: 'Go to partner space' });
		}
	}

	return (
		<nav className="container mx-auto flex h-20 items-center justify-between">
			<Link href="/">
				<SocialIncomeLogo />
			</Link>

			{session && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="flex h-12 items-center gap-2 rounded-full px-3">
							<Avatar>
								<AvatarFallback className="bg-primary text-background">
									{session.firstName?.[0]}
									{session.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-64">
						{menuLinks.map(({ href, label }) => (
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
			)}
		</nav>
	);
};
