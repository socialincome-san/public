import { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { LucideIcon, Settings, Settings2 } from 'lucide-react';

export type NavLink = {
	href: string;
	label: string;
	activeBase?: string;
	icon?: LucideIcon;
	isDropdown?: boolean;
};

export const useNavbarLinks = (user: UserInformation) => {
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
		...(user.role === 'admin'
			? [
					{
						href: '/portal/admin/organizations',
						activeBase: '/portal/admin',
						label: 'Admin',
						icon: Settings2,
					},
				]
			: []),
		{
			href: '/portal/account-settings',
			activeBase: '/portal/account-settings',
			label: 'Account settings',
			icon: Settings,
		},
	];

	const isActiveLink = (path: string, href: string, activeBase?: string) => path.startsWith(activeBase ?? href);

	return { mainNavLinks, userMenuNavLinks, isActiveLink };
};
