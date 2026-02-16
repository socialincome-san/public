import { Scope } from '@/components/app-shells/website/navbar/account-menu';
import { NavbarDesktop } from '@/components/app-shells/website/navbar/navbar-desktop';
import { NavbarMobile } from '@/components/app-shells/website/navbar/navbar-mobile';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ISbStoryData } from '@storyblok/js';

const storyblokService = new StoryblokService();

type Props = {
	session: Session | null;
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export async function Navbar({ session, lang, region, scope }: Props) {
	const { content } = await storyblokService.getStoryWithFallback<ISbStoryData<Layout>>(
		`${NEW_WEBSITE_SLUG}/layout`,
		lang,
	);

	return (
		<>
			<div className="relative hidden lg:block">
				<NavbarDesktop session={session} menu={content.menu} lang={lang} region={region} scope={scope} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile session={session} lang={lang} />
			</div>
		</>
	);
}
