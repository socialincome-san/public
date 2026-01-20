import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

type Props = {
	session?: ContributorSession | LocalPartnerSession;
	lang: WebsiteLanguage;
};

export const Navbar = ({ session, lang }: Props) => (
	<>
		<div className="hidden lg:block">
			<NavbarDesktop session={session} lang={lang} />
		</div>
		<div className="lg:hidden">
			<NavbarMobile session={session} lang={lang} />
		</div>
	</>
);
