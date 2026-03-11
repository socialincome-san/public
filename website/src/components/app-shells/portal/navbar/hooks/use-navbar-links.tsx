import { ROUTE_FRAGMENTS, ROUTES } from '@/lib/constants/routes';
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
			href: ROUTES.portalPrograms,
			activeBase: ROUTE_FRAGMENTS.portalPrograms,
			label: 'Programs',
			isDropdown: true,
		},
		{
			href: ROUTES.portalMonitoringPayoutConfirmation,
			activeBase: ROUTE_FRAGMENTS.portalMonitoring,
			label: 'Monitoring',
		},
		{
			href: ROUTES.portalManagementRecipients,
			activeBase: ROUTE_FRAGMENTS.portalManagement,
			label: 'Management',
		},
		{
			href: ROUTES.portalDeliveryMakePayouts,
			activeBase: ROUTE_FRAGMENTS.portalDelivery,
			label: 'Delivery',
		},
	];

	const userMenuNavLinks: NavLink[] = [
		{
			href: ROUTES.portalProfile,
			activeBase: ROUTE_FRAGMENTS.portalProfile,
			label: 'Profile',
			icon: User,
		},
		...(hasContributor
			? [
					{
						href: ROUTES.dashboardContributions,
						label: 'Switch to dashboard',
						icon: LayoutDashboard,
					},
				]
			: []),
		...(user?.role === 'admin'
			? [
					{
						href: ROUTES.portalAdminOrganizations,
						activeBase: ROUTE_FRAGMENTS.portalAdmin,
						label: 'Admin',
						icon: Settings,
					},
				]
			: []),
	];

	const isActiveLink = (path: string, href: string, activeBase?: string) => path.startsWith(activeBase ?? href);

	return { mainNavLinks, userMenuNavLinks, isActiveLink };
};
