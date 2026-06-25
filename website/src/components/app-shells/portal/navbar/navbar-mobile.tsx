'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { ProgramDropdown } from '@/components/app-shells/portal/navbar/program-dropdown';
import { UserMenu } from '@/components/app-shells/portal/navbar/user-menu';
import { Separator } from '@/components/breadcrumb/separator';
import { Button } from '@/components/button';
import { SILogo } from '@/components/svg/si-logo';
import type { Session } from '@/lib/firebase/current-account';
import type { UserSession } from '@/lib/services/user/user.types';
import { cn } from '@/lib/utils/cn';
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
				<Button
					variant="ghost"
					onClick={toggleMenu}
					className="relative -ml-2 flex h-9 w-9 items-center justify-center [&_svg]:size-5"
				>
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

				<SILogo className="absolute left-1/2 -translate-x-1/2 transform" />
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
										className="w-full justify-start px-3 py-2 text-base font-medium"
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
							<UserMenu
								sessions={sessions}
								align="start"
								triggerClassName="h-auto w-full justify-start gap-3 rounded-xl p-3"
								onNavigate={() => setIsMenuOpen(false)}
							/>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
