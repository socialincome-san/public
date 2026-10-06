import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { type PortalNavbarLink } from '@socialincome/design-system/navigation/portal-navbar/portal-navbar';
import { type PortalUserMenuLink } from '@socialincome/design-system/navigation/portal-user-menu/portal-user-menu';
import { LayoutDashboard, Settings, User } from 'lucide-react';

type MainNavLink = {
	href: string;
	label: string;
	activeBase: string;
};

export const useNavbarLinks = (sessions: Session[], pathname: string) => {
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const canAccessOperatorSections = Boolean(user?.hasAnyOperatorProgramAccess);
	const isAdmin = user?.role === 'admin';

	const mainNavLinks: MainNavLink[] = [
		...(canAccessOperatorSections
			? [
					{
						href: '/portal/monitoring/payout-confirmation',
						activeBase: '/portal/monitoring',
						label: 'Monitoring',
					},
					{
						href: '/portal/management/recipients',
						activeBase: '/portal/management',
						label: 'Management',
					},
					{
						href: '/portal/delivery/overview',
						activeBase: '/portal/delivery',
						label: 'Delivery',
					},
				]
			: []),
		...(isAdmin
			? [
					{
						href: '/portal/messaging/templates',
						activeBase: '/portal/messaging',
						label: 'Messaging',
					},
				]
			: []),
	];

	const userMenuNavLinks: PortalUserMenuLink[] = [
		{ href: '/portal/profile/account', label: 'Profile', icon: User },
		...(hasContributor ? [{ href: '/dashboard/subscriptions', label: 'Switch to dashboard', icon: LayoutDashboard }] : []),
		...(isAdmin ? [{ href: '/portal/admin/organizations', label: 'Admin', icon: Settings }] : []),
	];

	const links: PortalNavbarLink[] = mainNavLinks.map(({ href, label, activeBase }) => ({
		href,
		label,
		active: pathname.startsWith(activeBase),
	}));

	return { links, isProgramsActive: pathname.startsWith('/portal/programs'), userMenuNavLinks };
};
