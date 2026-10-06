'use client';

import { useLogout } from '@/components/app-shells/use-logout';
import { displaySession, type Scope } from '@/components/app-shells/website/navbar/utils';
import { useTranslator } from '@/lib/i18n/use-translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Session } from '@/modules/auth/auth.types';
import {
	SiteAccountMenu,
	type SiteAccountMenuLink,
} from '@socialincome/design-system/navigation/site-account-menu/site-account-menu';
import { Building2, LayoutDashboard, User, Users } from 'lucide-react';

type Props = {
	sessions: Session[];
	scope: Scope;
	lang: WebsiteLanguage;
};

export const AccountMenu = ({ sessions, scope, lang }: Props) => {
	const { logout } = useLogout();
	const translator = useTranslator(lang, 'website-me');
	const session = displaySession(sessions, scope);

	if (!session || !translator) {
		return null;
	}

	const hasUser = sessions.some((s) => s.type === 'user');
	const hasContributor = sessions.some((s) => s.type === 'contributor');
	const hasLocalPartner = sessions.some((s) => s.type === 'local-partner');

	const links: SiteAccountMenuLink[] = [];

	switch (scope) {
		case 'website':
			if (hasUser) {
				links.push({ href: '/portal', label: translator.t('navigation.go-to-portal'), icon: Users });
			}
			if (hasContributor) {
				links.push({
					href: '/dashboard/subscriptions',
					label: translator.t('navigation.go-to-dashboard'),
					icon: LayoutDashboard,
				});
			}
			if (hasLocalPartner) {
				links.push({
					href: '/partner-space/recipients',
					label: translator.t('navigation.go-to-partner-space'),
					icon: Building2,
				});
			}
			break;
		case 'partner-space':
			links.push({ href: '/partner-space/profile', label: translator.t('profile.link'), icon: User });
			if (hasUser) {
				links.push({ href: '/portal', label: translator.t('navigation.go-to-portal'), icon: Users });
			}
			if (hasContributor) {
				links.push({
					href: '/dashboard/subscriptions',
					label: translator.t('navigation.go-to-dashboard'),
					icon: LayoutDashboard,
				});
			}
			break;
		case 'dashboard':
		default:
			links.push({ href: '/dashboard/profile', label: translator.t('profile.link'), icon: User });
			if (hasUser) {
				links.push({ href: '/portal', label: translator.t('navigation.go-to-portal'), icon: Users });
			}
			if (hasLocalPartner) {
				links.push({
					href: '/partner-space/recipients',
					label: translator.t('navigation.go-to-partner-space'),
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
			signOutLabel={translator.t('security.sign-out.button')}
			onSignOut={() => void logout()}
		/>
	);
};
