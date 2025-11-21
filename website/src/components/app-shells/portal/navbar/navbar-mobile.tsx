'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Separator } from '@/components/breadcrumb/separator';
import { Button } from '@/components/button';
import { UserSession } from '@socialincome/shared/src/database/services/user/user.types';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLogout } from './hooks/use-logout';
import { useNavbarLinks } from './hooks/use-navbar-links';
import { Logo } from './logo';
import { ProgramDropdown } from './program-dropdown';

export const NavbarMobile = ({ user }: { user: UserSession }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const { mainNavLinks, userMenuNavLinks, isActiveLink } = useNavbarLinks(user);
	const { logout } = useLogout();

	const toggleMenu = () => setIsMenuOpen((v) => !v);

	const ProfileName = () => (
		<div className="flex items-center space-x-3">
			<Avatar>
				<AvatarFallback className="bg-primary text-background">
					{user.firstName?.charAt(0)}
					{user.lastName?.charAt(0)}
				</AvatarFallback>
			</Avatar>
			<div className="text-left">
				<p className="text-foreground text-sm font-medium">
					{user.firstName} {user.lastName}
				</p>
				<p className="text-muted-foreground text-xs">{user.activeOrganization?.name ?? 'No active organization'}</p>
			</div>
		</div>
	);

	return (
		<nav className="mb-4 lg:hidden">
			<div className={`flex h-14 items-center justify-between px-4 ${!isMenuOpen ? 'border-border border-b' : ''}`}>
				<Button
					variant="ghost"
					onClick={toggleMenu}
					className="relative -ml-2 flex h-9 w-9 items-center justify-center [&_svg]:size-5"
				>
					<span
						className={`absolute transition-all duration-300 ${
							isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
						}`}
					>
						<Menu />
					</span>
					<span
						className={`absolute transition-all duration-300 ${
							isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
						}`}
					>
						<X />
					</span>
				</Button>

				<Logo className="absolute left-1/2 -translate-x-1/2 transform" />
			</div>

			{isMenuOpen && (
				<div className="border-border border-b">
					<div className="flex flex-col">
						<div className="flex-grow space-y-1 overflow-y-auto p-2">
							{mainNavLinks.map(({ href, label, isDropdown, activeBase }) =>
								isDropdown ? (
									<ProgramDropdown
										key={href}
										user={user}
										active={isActiveLink(pathname, href, activeBase)}
										className="w-full justify-start px-3 py-2 text-base font-medium"
									/>
								) : (
									<Link
										key={href}
										href={href}
										onClick={() => setIsMenuOpen(false)}
										className={`block rounded-md px-3 py-2 text-base font-medium ${
											isActiveLink(pathname, href, activeBase)
												? 'bg-accent text-primary'
												: 'text-primary hover:bg-accent hover:text-primary'
										}`}
									>
										{label}
									</Link>
								),
							)}
						</div>

						<Separator />

						<div className="p-2">
							<ProfileName />

							<div className="mt-3 grid gap-1 p-2">
								{userMenuNavLinks.map(({ href, label }) => (
									<Link
										key={href}
										href={href}
										onClick={() => setIsMenuOpen(false)}
										className="text-muted-foreground hover:bg-accent rounded-md px-2 py-2 font-medium"
									>
										{label}
									</Link>
								))}

								<Separator className="my-2" />

								<button
									onClick={logout}
									className="text-destructive hover:bg-accent/50 rounded-md px-2 py-2 text-left font-medium"
								>
									Sign out
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
