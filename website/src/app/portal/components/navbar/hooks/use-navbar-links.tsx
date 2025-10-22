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
			label: 'Programs',
			isDropdown: true,
		},
		{
			href: '/portal/monitoring/payout-confirmation',
			label: 'Monitoring',
		},
		{
			href: '/portal/management/recipients',
			label: 'Management',
		},
		{
			href: '/portal/delivery/make-payouts',
			label: 'Delivery',
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

	const isActiveLink = (path: string, href: string) => path.startsWith(href);

	return { mainNavLinks, userMenuNavLinks, isActiveLink };
};
