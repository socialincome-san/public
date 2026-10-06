'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { ProgramDropdown } from '@/components/app-shells/portal/navbar/program-dropdown';
import { UserMenu } from '@/components/app-shells/portal/navbar/user-menu';
import { SILogo } from '@/components/svg/si-logo';
import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { Button } from '@socialincome/design-system/button/button';
import { cn } from '@socialincome/design-system/cn';
import { Separator } from '@socialincome/design-system/separator/separator';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavbarMobileProps = {
	sessions: Session[];
};

export const NavbarMobile = ({ sessions }: NavbarMobileProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const { mainNavLinks, isActiveLink } = useNavbarLinks(sessions);

	if (!user) {
		return null;
	}

	const toggleMenu = () => setIsMenuOpen((v) => !v);

	return (
		<nav className="mb-4 lg:hidden">
			<div className={cn('flex h-14 items-center justify-between px-4', !isMenuOpen && 'border-border border-b')}>
				<Button variant="ghost" size="icon" onClick={toggleMenu}>
					<span
						className={cn(
							'absolute transition-all duration-300',
							isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100',
						)}
					>
						<Menu />
					</span>
					<span
						className={cn(
							'absolute transition-all duration-300',
							isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0',
						)}
					>
						<X />
					</span>
				</Button>

				<span className="absolute left-1/2 -translate-x-1/2">
					<SILogo />
				</span>
			</div>

			{isMenuOpen && (
				<div className="border-border border-b">
					<div className="flex flex-col">
						<div className="grow space-y-1 overflow-y-auto p-2">
							{mainNavLinks.map(({ href, label, isDropdown, activeBase }) =>
								isDropdown ? (
									<ProgramDropdown
										key={href}
										sessions={sessions}
										active={isActiveLink(pathname, href, activeBase)}
										variant="menu"
									/>
								) : (
									<Link
										key={href}
										href={href}
										onClick={() => setIsMenuOpen(false)}
										className={cn(
											'block rounded-md px-3 py-2 text-base font-medium',
											isActiveLink(pathname, href, activeBase)
												? 'bg-accent text-primary'
												: 'text-primary hover:bg-accent hover:text-primary',
										)}
									>
										{label}
									</Link>
								),
							)}
						</div>

						<Separator />

						<div className="p-2">
							<UserMenu sessions={sessions} align="start" variant="menu" onNavigate={() => setIsMenuOpen(false)} />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
