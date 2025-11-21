import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

export const Navbar = ({ contributor }: { contributor?: ContributorSession }) => (
	<>
		<div className="hidden lg:block">
			<NavbarDesktop contributor={contributor} />
		</div>
		<div className="lg:hidden">
			<NavbarMobile contributor={contributor} />
		</div>
	</>
);
