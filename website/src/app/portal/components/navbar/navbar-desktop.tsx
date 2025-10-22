'use client';

import { Avatar, AvatarFallback } from '@/app/portal/components/avatar';
import { Button } from '@/app/portal/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/app/portal/components/dropdown-menu';
import { Logo } from '@/app/portal/components/logo';
import { useNavbarLinks } from '@/app/portal/components/navbar/hooks/use-navbar-links';
import type { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { ChevronsUpDown, LogOut, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useLogout } from './hooks/use-logout';

export const NavbarDesktop = ({ user }: { user: UserInformation }) => {
	const pathname = usePathname();
	const { mainNavLinks, userMenuNavLinks, isActiveLink } = useNavbarLinks(user);
	const { logout } = useLogout();

	const activeOrganization = user.activeOrganization?.name ?? 'No active organization';

	return (
		<nav className="container flex h-20 items-center justify-between">
			<Link href="/portal">
				<Logo />
			</Link>

			<div className="flex items-center gap-x-4">
				<nav className="flex items-center gap-4">
					{mainNavLinks.map(({ href, label, isDropdown }) => {
						const active = isActiveLink(pathname, href);
						const baseClasses =
							'relative rounded-md px-3 py-2 text-lg font-medium text-primary hover:bg-accent transition-colors duration-200';

						if (isDropdown) {
							return (
								<DropdownMenu key={href}>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className={twMerge(baseClasses)}>
											{active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
											<span>{label}</span>
										</Button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="start" className="w-56">
										{user.programs?.length ? (
											user.programs.map((program) => (
												<DropdownMenuItem asChild key={program.id}>
													<Link href={`/portal/programs/${program.id}/recipients`}>{program.name}</Link>
												</DropdownMenuItem>
											))
										) : (
											<DropdownMenuItem disabled>No programs</DropdownMenuItem>
										)}

										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href="/portal/programs/create" className="text-primary flex items-center gap-2 font-medium">
												<Wallet className="h-4 w-4" />
												Create new program
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							);
						}

						return (
							<Link key={href} href={href} className={twMerge(baseClasses)}>
								{active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
								{label}
							</Link>
						);
					})}
				</nav>
			</div>

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
							<p className="text-muted-foreground text-xs">{activeOrganization}</p>
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
						onSelect={(e) => {
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
