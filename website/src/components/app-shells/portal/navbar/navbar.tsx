'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { useLogout } from '@/components/app-shells/use-logout';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { PortalNavbar } from '@socialincome/design-system/navigation/portal-navbar/portal-navbar';
import { usePathname } from 'next/navigation';

type NavbarProps = {
	sessions: Session[];
};

export const Navbar = ({ sessions }: NavbarProps) => {
	const pathname = usePathname();
	const { logout } = useLogout();
	const { t } = usePortalSharedTranslations();
	const { links, isProgramsActive, userMenuNavLinks } = useNavbarLinks(sessions, pathname);
	const user = sessions.find((s): s is UserSession => s.type === 'user');

	if (!user) {
		return null;
	}

	return (
		<PortalNavbar
			homeHref="/portal"
			links={links}
			programMenu={{
				label: t('navbar.programs', 'Programs'),
				active: isProgramsActive,
				programs: user.programs.map(({ id, name }) => ({ href: `/portal/programs/${id}/overview`, label: name })),
				emptyLabel: t('navbar.noPrograms', 'No programs'),
				createProgramLabel: t('navbar.createProgram', 'Create new program'),
				renderCreateProgram: (trigger) => <CreateProgramModal isAuthenticated trigger={trigger} />,
			}}
			userMenu={{
				name: [user.firstName, user.lastName].join(' '),
				initials: `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`,
				subtitle: user.activeOrganization?.name ?? t('navbar.noActiveOrganization', 'No active organization'),
				links: userMenuNavLinks,
				signOutLabel: t('navbar.signOut', 'Sign out'),
				onSignOut: () => void logout(),
			}}
		/>
	);
};
