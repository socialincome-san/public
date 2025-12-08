'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import type { UserSession } from '@/lib/services/user/user.types';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useLogout } from '../../use-logout';
import { useNavbarLinks } from './hooks/use-navbar-links';
import { Logo } from './logo';
import { ProgramDropdown } from './program-dropdown';

export const NavbarDesktop = ({ user }: { user: UserSession }) => {
	const pathname = usePathname();
	const { mainNavLinks, userMenuNavLinks, isActiveLink } = useNavbarLinks(user);
	const { logout } = useLogout();

	return (
		<nav className="container flex h-20 items-center justify-between">
			<Link href="/portal">
				<Logo />
			</Link>

			{/* MAIN NAV LINKS */}
			<div className="flex items-center gap-x-4">
				<nav className="flex items-center gap-4">
					{mainNavLinks.map(({ href, label, isDropdown, activeBase }) =>
						isDropdown ? (
							<ProgramDropdown
								key={href}
								user={user}
								active={isActiveLink(pathname, href, activeBase)}
								className="relative text-lg"
							/>
						) : (
							<Link
								key={href}
								href={href}
								className={twMerge(
									'text-primary hover:bg-accent relative rounded-md px-3 py-2 text-lg font-medium transition-colors duration-200',
								)}
							>
								{isActiveLink(pathname, href, activeBase) && (
									<span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />
								)}
								{label}
							</Link>
						),
					)}
				</nav>
			</div>

			{/* USER MENU */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex h-12 items-center gap-2 rounded-full px-3">
						<Avatar>
							<AvatarFallback className="bg-primary text-background">
								{user.firstName?.[0]}
								{user.lastName?.[0]}
							</AvatarFallback>
						</Avatar>
						<div className="text-left">
							<p className="text-sm font-medium">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-muted-foreground text-xs">
								{user.activeOrganization?.name ?? 'No active organization'}
							</p>
						</div>
						<ChevronsUpDown className="h-4 w-4 opacity-50" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-64">
					{userMenuNavLinks.map(({ href, label, icon: Icon }) => (
						<DropdownMenuItem asChild key={href}>
							<Link href={href} className="flex items-center gap-2">
								{Icon && <Icon className="h-4 w-4" />}
								<span>{label}</span>
							</Link>
						</DropdownMenuItem>
					))}

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onSelect={(e: Event) => {
							e.preventDefault();
							logout();
						}}
						className="text-destructive focus:text-destructive"
					>
						<LogOut className="mr-2 h-4 w-4" />
						<span>Sign out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</nav>
	);
};
