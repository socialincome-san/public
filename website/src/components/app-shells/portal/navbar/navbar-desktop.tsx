'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { ProgramDropdown } from '@/components/app-shells/portal/navbar/program-dropdown';
import { UserMenu } from '@/components/app-shells/portal/navbar/user-menu';
import { SILogo } from '@/components/svg/si-logo';
import type { Session } from '@/lib/firebase/current-account';
import type { UserSession } from '@/lib/services/user/user.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

type NavbarDesktopProps = {
	sessions: Session[];
};

export const NavbarDesktop = ({ sessions }: NavbarDesktopProps) => {
	const pathname = usePathname();
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const { mainNavLinks, isActiveLink } = useNavbarLinks(sessions);

	if (!user) {
		return null;
	}

	return (
		<nav className="w-site-width max-w-content mx-auto flex h-20 items-center justify-between">
			<Link href="/portal">
				<SILogo />
			</Link>

			{/* MAIN NAV LINKS */}
			<div className="flex items-center gap-x-4">
				<nav className="flex items-center gap-4">
					{mainNavLinks.map(({ href, label, isDropdown, activeBase }) =>
						isDropdown ? (
							<ProgramDropdown
								key={href}
								sessions={sessions}
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

			<UserMenu sessions={sessions} triggerClassName="h-12" />
		</nav>
	);
};
