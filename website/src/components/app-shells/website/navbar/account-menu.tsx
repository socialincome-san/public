'use client';

import { useLogout } from '@/components/app-shells/use-logout';
import { displaySession, Scope } from '@/components/app-shells/website/navbar/utils';
import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import type { Session } from '@/lib/firebase/current-account';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Building2, LayoutDashboard, LogOut, User, Users } from 'lucide-react';
import Link from 'next/link';

type Props = {
	sessions: Session[];
	scope: Scope;
	lang: WebsiteLanguage;
};

export const AccountMenu = ({ sessions, scope, lang }: Props) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');
	const session = displaySession(sessions, scope);
	const hasUser = sessions.some((s) => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const hasLocalPartner = sessions.some((s) => s.type === 'local-partner');

	const items: { href: string; label: string; icon: typeof User }[] = [];

	switch (scope) {
		case 'website':
			if (hasUser) {
				items.push({ href: '/portal', label: translator?.t('navigation.go-to-portal') ?? 'Go to portal', icon: Users });
			}
			if (hasContributor) {
				items.push({
					href: '/dashboard/contributions',
					label: translator?.t('navigation.go-to-dashboard') ?? 'Go to dashboard',
					icon: LayoutDashboard,
				});
			}
			if (hasLocalPartner) {
				items.push({
					href: '/partner-space/recipients',
					label: translator?.t('navigation.go-to-partner-space') ?? 'Go to partner space',
					icon: Building2,
				});
			}
			break;
		case 'partner-space':
			items.push({ href: '/partner-space/profile', label: translator?.t('profile.link') ?? 'Profile', icon: User });
			if (hasUser) {
				items.push({ href: '/portal', label: translator?.t('navigation.go-to-portal') ?? 'Go to portal', icon: Users });
			}
			if (hasContributor) {
				items.push({
					href: '/dashboard/contributions',
					label: translator?.t('navigation.go-to-dashboard') ?? 'Go to dashboard',
					icon: LayoutDashboard,
				});
			}
			break;
		case 'dashboard':
		default:
			items.push({ href: '/dashboard/profile', label: translator?.t('profile.link') ?? 'Profile', icon: User });
			if (hasUser) {
				items.push({ href: '/portal', label: translator?.t('navigation.go-to-portal') ?? 'Go to portal', icon: Users });
			}
			if (hasLocalPartner) {
				items.push({
					href: '/partner-space/recipients',
					label: translator?.t('navigation.go-to-partner-space') ?? 'Go to partner space',
					icon: Building2,
				});
			}
			break;
	}

	if (!session) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="flex h-10 items-center gap-2 rounded-full px-3">
					<Avatar className="h-7 w-7">
						<AvatarFallback className="text-sm">
							{session.firstName?.[0]}
							{session.lastName?.[0]}
						</AvatarFallback>
					</Avatar>

					<span className="text-sm font-medium">
						{session.firstName} {session.lastName}
					</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<DropdownMenuItem key={item.href} asChild>
							<Link href={item.href} className="flex items-center gap-2">
								<Icon className="h-4 w-4" />
								<span>{item.label}</span>
							</Link>
						</DropdownMenuItem>
					);
				})}

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onSelect={(e: Event) => {
						e.preventDefault();
						logout();
					}}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{translator?.t('security.sign-out.button') ?? 'Logout'}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
