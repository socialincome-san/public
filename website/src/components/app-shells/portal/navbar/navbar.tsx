'use client';

import type { Session } from '@/modules/auth/auth.types';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

type NavbarProps = {
	sessions: Session[];
};

export const Navbar = ({ sessions }: NavbarProps) => {
	return (
		<>
			<div className="hidden lg:block">
				<NavbarDesktop sessions={sessions} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile sessions={sessions} />
			</div>
		</>
	);
};
