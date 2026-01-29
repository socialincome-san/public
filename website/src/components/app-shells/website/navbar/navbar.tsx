import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

type Props = {
	session?: ContributorSession | LocalPartnerSession;
	lang: WebsiteLanguage;
};

export async function Navbar({ session, lang }: Props) {
	const storyblokService = new StoryblokService();
	const result = await storyblokService.getNavItems();

	const navItems = result.success && result.data ? result.data : [];

	return (
		<>
			<div className="hidden lg:block">
				<NavbarDesktop session={session} lang={lang} navItems={navItems} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile session={session} lang={lang} />
			</div>
		</>
	);
}
