import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

export const Navbar = ({ contributor, lang }: { contributor?: ContributorSession; lang: WebsiteLanguage }) => (
	<>
		<div className="hidden lg:block">
			<NavbarDesktop contributor={contributor} lang={lang} />
		</div>
		<div className="lg:hidden">
			<NavbarMobile contributor={contributor} lang={lang} />
		</div>
	</>
);
