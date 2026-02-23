import type { Session } from '@/lib/firebase/current-account';
import type { UserSession } from '@/lib/services/user/user.types';
import { LayoutDashboard, LucideIcon, Settings, User } from 'lucide-react';

type NavLink = {
	href: string;
	label: string;
	activeBase?: string;
	icon?: LucideIcon;
	isDropdown?: boolean;
};

export const useNavbarLinks = (sessions: Session[]) => {
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const mainNavLinks: NavLink[] = [
		{
			href: '/portal/programs',
			activeBase: '/portal/programs',
			label: 'Programs',
			isDropdown: true,
		},
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
			href: '/portal/delivery/make-payouts',
			activeBase: '/portal/delivery',
			label: 'Delivery',
		},
	];

	const userMenuNavLinks: NavLink[] = [
		{
			href: '/portal/profile',
			activeBase: '/portal/profile',
			label: 'Profile',
			icon: User,
		},
		...(hasContributor
			? [
					{
						href: '/dashboard/contributions',
						label: 'Switch to dashboard',
						icon: LayoutDashboard,
					},
				]
			: []),
		...(user?.role === 'admin'
			? [
					{
						href: '/portal/admin/organizations',
						activeBase: '/portal/admin',
						label: 'Admin',
						icon: Settings,
					},
				]
			: []),
	];

	const isActiveLink = (path: string, href: string, activeBase?: string) => path.startsWith(activeBase ?? href);

	return { mainNavLinks, userMenuNavLinks, isActiveLink };
};
