'use client';

import { NavbarMobile } from '@/app/portal/components/navbar/navbar-mobile';
import { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { NavbarDesktop } from './navbar-desktop';

export const Navbar = ({ user }: { user: UserInformation }) => {
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
