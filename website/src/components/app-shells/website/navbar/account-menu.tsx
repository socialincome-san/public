'use client';

import { useLogout } from '@/components/app-shells/use-logout';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import type { Session } from '@/modules/auth/auth.types';
import {
	SiteAccountMenu,
	type SiteAccountMenuLink,
} from '@socialincome/design-system/navigation/site-account-menu/site-account-menu';
import { Building2, LayoutDashboard, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
	sessions: Session[];
	scope: Scope;
};

export const AccountMenu = ({ sessions, scope }: Props) => {
	const { logout } = useLogout();
	const dashboardPath = `${useWebsiteBasePath()}/dashboard`;
	const t = useTranslations('website-me');
	const session = displaySession(sessions, scope);

	if (!session) {
		return null;
	}

	const hasUser = sessions.some((s) => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const hasLocalPartner = sessions.some((s) => s.type === 'local-partner');

	const links: SiteAccountMenuLink[] = [];

	switch (scope) {
		case 'website':
			if (hasUser) {
				links.push({ href: '/portal', label: t('navigation.go-to-portal'), icon: Users });
			}
			if (hasContributor) {
				links.push({
					href: `${dashboardPath}/subscriptions`,
					label: t('navigation.go-to-dashboard'),
					icon: LayoutDashboard,
				});
			}
			if (hasLocalPartner) {
				links.push({
					href: '/partner-space/recipients',
					label: t('navigation.go-to-partner-space'),
					icon: Building2,
				});
			}
			break;
		case 'partner-space':
			links.push({ href: '/partner-space/profile', label: t('profile.link'), icon: User });
			if (hasUser) {
				links.push({ href: '/portal', label: t('navigation.go-to-portal'), icon: Users });
			}
			if (hasContributor) {
				links.push({
					href: `${dashboardPath}/subscriptions`,
					label: t('navigation.go-to-dashboard'),
					icon: LayoutDashboard,
				});
			}
			break;
		case 'dashboard':
		default:
			links.push({ href: `${dashboardPath}/profile`, label: t('profile.link'), icon: User });
			if (hasUser) {
				links.push({ href: '/portal', label: t('navigation.go-to-portal'), icon: Users });
			}
			if (hasLocalPartner) {
				links.push({
					href: '/partner-space/recipients',
					label: t('navigation.go-to-partner-space'),
					icon: Building2,
				});
			}
			break;
	}

	return (
		<SiteAccountMenu
			firstName={session.firstName}
			lastName={session.lastName}
			links={links}
			signOutLabel={t('security.sign-out.button')}
			onSignOut={() => void logout()}
		/>
	);
};
