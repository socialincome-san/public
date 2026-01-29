import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { Scope } from './account-menu';
import { NavbarDesktop } from './navbar-desktop';
import { NavbarMobile } from './navbar-mobile';

type Props = {
	session: Session | null;
	lang: WebsiteLanguage;
	scope: Scope;
};

export async function Navbar({ session, lang, scope }: Props) {
	const storyblokService = new StoryblokService();
	const result = await storyblokService.getNavItems();

	const navItems = result.success && result.data ? result.data : [];

	return (
		<>
			<div className="hidden lg:block">
				<NavbarDesktop session={session} lang={lang} navItems={navItems} scope={scope} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile session={session} lang={lang} />
			</div>
		</>
	);
}
