'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';
import { SILogo } from '../../brand/logo/logo';
import { Separator } from '../../data-display/separator/separator';
import { PortalProgramMenu, type PortalProgramMenuProps } from '../portal-program-menu/portal-program-menu';
import { PortalUserMenu, type PortalUserMenuProps } from '../portal-user-menu/portal-user-menu';

export type PortalNavbarLink = {
	href: string;
	label: string;
	active: boolean;
};

export type PortalNavbarProps = {
	homeHref: string;
	links: PortalNavbarLink[];
	programMenu: Omit<PortalProgramMenuProps, 'variant'>;
	userMenu: Omit<PortalUserMenuProps, 'variant' | 'align' | 'onNavigate'>;
};

const PortalNavbarDesktop = ({ homeHref, links, programMenu, userMenu }: PortalNavbarProps) => (
	<nav className="w-site-width max-w-content mx-auto flex h-20 items-center justify-between">
		<Link href={homeHref}>
			<SILogo />
		</Link>

		<div className="flex items-center gap-x-4">
			<nav className="flex items-center gap-4">
				<PortalProgramMenu {...programMenu} variant="bar" />
				{links.map(({ href, label, active }) => (
					<Link
						key={href}
						href={href}
						className="text-primary hover:bg-accent relative rounded-md px-3 py-2 text-lg font-medium transition-colors duration-200"
					>
						{active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
						{label}
					</Link>
				))}
			</nav>
		</div>

		<PortalUserMenu {...userMenu} variant="bar" />
	</nav>
);

const PortalNavbarMobile = ({ links, programMenu, userMenu }: PortalNavbarProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const closeMenu = () => setIsMenuOpen(false);

	return (
		<nav className="mb-4 lg:hidden">
			<div className={cn('flex h-14 items-center justify-between px-4', !isMenuOpen && 'border-border border-b')}>
				<Button variant="ghost" size="icon" onClick={() => setIsMenuOpen((open) => !open)}>
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
							<PortalProgramMenu {...programMenu} variant="menu" />
							{links.map(({ href, label, active }) => (
								<Link
									key={href}
									href={href}
									onClick={closeMenu}
									className={cn(
										'block rounded-md px-3 py-2 text-base font-medium',
										active ? 'bg-accent text-primary' : 'text-primary hover:bg-accent hover:text-primary',
									)}
								>
									{label}
								</Link>
							))}
						</div>

						<Separator />

						<div className="p-2">
							<PortalUserMenu {...userMenu} variant="menu" align="start" onNavigate={closeMenu} />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export const PortalNavbar = (props: PortalNavbarProps) => (
	<>
		<div className="hidden lg:block">
			<PortalNavbarDesktop {...props} />
		</div>
		<div className="lg:hidden">
			<PortalNavbarMobile {...props} />
		</div>
	</>
);
