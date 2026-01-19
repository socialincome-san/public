import { UserSession } from '@/lib/services/user/user.types';
import { LucideIcon, Settings, User } from 'lucide-react';

type NavLink = {
	href: string;
	label: string;
	activeBase?: string;
	icon?: LucideIcon;
	isDropdown?: boolean;
};

export const useNavbarLinks = (user: UserSession) => {
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
		...(user.role === 'admin'
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
