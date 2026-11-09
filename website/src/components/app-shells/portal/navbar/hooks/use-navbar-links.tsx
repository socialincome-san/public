import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { type PortalNavbarLink } from '@socialincome/design-system/navigation/portal-navbar/portal-navbar';
import { type PortalUserMenuLink } from '@socialincome/design-system/navigation/portal-user-menu/portal-user-menu';
import { LayoutDashboard, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

type MainNavLink = {
	href: string;
	label: string;
	activeBase: string;
};

export const useNavbarLinks = (sessions: Session[], pathname: string) => {
	const t = useTranslations('portal-shared');
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
						label: t('navbar.monitoring'),
					},
					{
						href: '/portal/management/recipients',
						activeBase: '/portal/management',
						label: t('navbar.management'),
					},
					{
						href: '/portal/delivery/overview',
						activeBase: '/portal/delivery',
						label: t('navbar.delivery'),
					},
				]
			: []),
		...(isAdmin
			? [
					{
						href: '/portal/messaging/templates',
						activeBase: '/portal/messaging',
						label: t('navbar.messaging'),
					},
				]
			: []),
	];

	const userMenuNavLinks: PortalUserMenuLink[] = [
		{ href: '/portal/profile/account', label: t('navbar.profile'), icon: User },
		...(hasContributor
			? [
					{
						href: '/dashboard/subscriptions',
						label: t('navbar.switchToDashboard'),
						icon: LayoutDashboard,
					},
				]
			: []),
		...(isAdmin ? [{ href: '/portal/admin/organizations', label: t('navbar.admin'), icon: Settings }] : []),
	];

	const links: PortalNavbarLink[] = mainNavLinks.map(({ href, label, activeBase }) => ({
		href,
		label,
		active: pathname.startsWith(activeBase),
	}));

	return { links, isProgramsActive: pathname.startsWith('/portal/programs'), userMenuNavLinks };
};
