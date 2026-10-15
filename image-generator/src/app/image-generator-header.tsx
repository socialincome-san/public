'use client';

import { SiteHeader, type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';
import { SiteMenuMobile } from '@socialincome/design-system/navigation/site-header/site-menu-mobile';
import { usePathname } from 'next/navigation';

export const ImageGeneratorHeader = () => {
	const isGallery = usePathname() === '/images';
	const menuEntries: SiteMenuEntry[] = [
		isGallery
			? { href: '/', id: 'generator', label: 'Generator', type: 'link' }
			: { href: '/images', id: 'gallery', label: 'Gallery', type: 'link' },
	];

	return (
		<SiteHeader
			account={null}
			desktopMenu={<SiteMenuDesktop entries={menuEntries} />}
			homeHref="/"
			homeLinkLabel="Image generator"
			mobileMenu={
				<SiteMenuMobile
					entries={menuEntries}
					footerControls={null}
					homeHref="/"
					labels={{
						back: 'Back',
						closeMenu: 'Close menu',
						homeLink: 'Image generator',
						openMenu: 'Open menu',
						title: 'Menu',
					}}
				/>
			}
			width="compact"
		/>
	);
};
