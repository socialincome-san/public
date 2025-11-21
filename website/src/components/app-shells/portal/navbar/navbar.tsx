'use client';

import { UserSession } from '@socialincome/shared/src/database/services/user/user.types';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

export const Navbar = ({ user }: { user: UserSession }) => {
	return (
		<>
			<div className="hidden lg:block">
				<NavbarDesktop user={user} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile user={user} />
			</div>
		</>
	);
};
