import { Button } from '@socialincome/design-system/actions/button/button';
import { SiteHeader, type SiteMenuEntry } from '@socialincome/design-system/navigation/site-header/site-header';
import { SiteMenuDesktop } from '@socialincome/design-system/navigation/site-header/site-menu-desktop';
import { SiteMenuMobile } from '@socialincome/design-system/navigation/site-header/site-menu-mobile';
import Link from 'next/link';

export const ImageGeneratorHeader = () => {
	const menuEntries: SiteMenuEntry[] = [
		{ type: 'link', id: 'generator', label: 'Generator', href: '/' },
		{ type: 'link', id: 'gallery', label: 'Gallery', href: '/images' },
	];

	return (
		<SiteHeader
			account={null}
			desktopMenu={
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<SiteMenuDesktop entries={menuEntries} />
				</div>
			}
			donateAction={
				<Button asChild size="md">
					<Link href="https://socialincome.org" target="_blank" rel="noopener noreferrer">
						Webseite
					</Link>
				</Button>
			}
			homeHref="/"
			homeLinkLabel="Image Generator"
			mobileMenu={
				<SiteMenuMobile
					entries={menuEntries}
					footerControls={null}
					homeHref="/"
					labels={{
						back: 'Back',
						closeMenu: 'Close menu',
						homeLink: 'Image Generator',
						openMenu: 'Open menu',
						title: 'Menu',
					}}
				/>
			}
		/>
	);
};
