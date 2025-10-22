import { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { LucideIcon, Settings, Settings2 } from 'lucide-react';

export type NavLink = {
	href: string;
	label: string;
	activeBase?: string;
	exact?: boolean;
	icon?: LucideIcon;
	isDropdown?: boolean;
};

export const useNavbarLinks = (user: UserInformation) => {
	const mainNavLinks: NavLink[] = [
		{
			href: '/portal/programs',
			label: 'Programs',
			isDropdown: true,
			activeBase: '/portal/programs',
		},
		{
			href: '/portal/monitoring/payout-confirmation',
			label: 'Monitoring',
			activeBase: '/portal/monitoring',
		},
		{
			href: '/portal/management/recipients',
			label: 'Management',
			activeBase: '/portal/management',
		},
		{
			href: '/portal/delivery/make-payouts',
			label: 'Delivery',
			activeBase: '/portal/delivery',
		},
	];

	const userMenuNavLinks: NavLink[] = [
		...(user.role === 'admin'
			? [
					{
						href: '/portal/admin/organizations',
						label: 'Admin',
						icon: Settings2,
					},
				]
			: []),

		{
			href: '/portal/account-settings',
			label: 'Account settings',
			icon: Settings,
		},
	];

	const isActiveLink = (path: string, href: string, exact?: boolean, activeBase?: string) => {
		if (exact) return path === href;
		const base = activeBase ?? href;
		return path === base || path.startsWith(base + '/');
	};

	return { mainNavLinks, userMenuNavLinks, isActiveLink };
};
