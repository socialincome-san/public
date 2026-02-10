'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { Session } from '@/lib/firebase/current-account';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import Link from 'next/link';
import { useLogout } from '../../use-logout';
import { Logo } from './logo';

type Props = {
	session: Session | null;
	lang: WebsiteLanguage;
};

export const NavbarMobile = ({ session, lang }: Props) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');
	const menuLinks = [
		{
			href: '/',
			label: translator?.t('metadata.home-link'),
		},
		{
			href: session?.type === 'local-partner' ? '/partner-space/profile' : '/dashboard/profile',
			label: translator?.t('profile.link') ?? 'Profile',
		},
	];

	return (
		<nav className="container flex h-20 items-center justify-between">
			<Link href="/">
				<Logo />
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
