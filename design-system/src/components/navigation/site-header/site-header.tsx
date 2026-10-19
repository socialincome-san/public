import NextLink from 'next/link';
import { type ReactNode } from 'react';
import { SocialIncomeLogo } from '../../brand/logo/logo';

export type SiteMenuLink = {
	id: string;
	label: string;
	href: string;
	newTab?: boolean;
};

export type SiteMenuGroup = {
	id: string;
	label: string;
	links: SiteMenuLink[];
	overview?: { label: string; href: string };
};

export type SiteMenuEntry =
	| ({ type: 'link' } & SiteMenuLink)
	| {
			type: 'dropdown';
			id: string;
			label: string;
			groups: SiteMenuGroup[];
	  };

type SiteHeaderProps = {
	homeHref: string;
	homeLinkLabel: string;
	desktopMenu: ReactNode;
	mobileMenu: ReactNode;
	account: ReactNode;
	localeSwitcher?: ReactNode;
	donateAction?: ReactNode;
};

export const SiteHeader = ({
	homeHref,
	homeLinkLabel,
	desktopMenu,
	mobileMenu,
	account,
	localeSwitcher,
	donateAction,
}: SiteHeaderProps) => (
	<nav className="bg-card max-w-content lg:w-site-width lg:shadow-card static inset-x-0 top-5 z-50 mx-auto flex h-18 w-full items-center justify-between px-4 py-2 lg:absolute lg:top-5 lg:h-14 lg:rounded-full lg:px-2">
		<NextLink href={homeHref} className="text-accent-foreground lg:ml-4" aria-label={homeLinkLabel}>
			<SocialIncomeLogo decorative />
		</NextLink>

		<div className="hidden lg:block">{desktopMenu}</div>

		<div className="flex items-center gap-4">
			{localeSwitcher && <div className="hidden sm:block">{localeSwitcher}</div>}
			<div className="hidden lg:block">{account}</div>
			{donateAction}
			{mobileMenu}
		</div>
	</nav>
);
