import NextLink from 'next/link';
import { type ReactNode } from 'react';
import { SocialIncomeLogo } from '../../brand/logo/logo';

export type SiteMenuLink = {
	id: string;
	label: string;
	href: string;
	newTab?: boolean;
	/** Replaces following the link on desktop, e.g. to open a dialog; `href` stays the fallback. */
	onSelect?: () => void;
};

type SiteMenuOverview = { label: string; href: string };

export type SiteMenuGroup = {
	id: string;
	label: string;
	links: SiteMenuLink[];
	overview?: SiteMenuOverview;
	/** Short fact under the label, e.g. "19 active programs". */
	subtitle?: string;
	illustrationSrc?: string;
};

export type SiteMenuDropdownFooter = {
	label: string;
	href?: string;
	countries?: (SiteMenuLink & { country: string })[];
	overview?: SiteMenuOverview;
	/** Puts the overview right after the label instead of at the far end. */
	overviewInline?: boolean;
};

export type SiteMenuEntry =
	| ({ type: 'link' } & SiteMenuLink)
	| {
			type: 'dropdown';
			id: string;
			label: string;
			groups: SiteMenuGroup[];
			footer?: SiteMenuDropdownFooter;
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

		{/* The ghost-style switcher and account bring their own padding; the margin gives the solid donate button the same visual gap */}
		<div className="flex items-center gap-2 lg:gap-1">
			{localeSwitcher && <div className="hidden sm:block">{localeSwitcher}</div>}
			<div className="hidden lg:block">{account}</div>
			{donateAction && <div className="lg:ml-3">{donateAction}</div>}
			{mobileMenu}
		</div>
	</nav>
);
