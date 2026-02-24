import type { Scope } from '@/components/app-shells/website/navbar/display-session';
import { NavbarDesktop } from '@/components/app-shells/website/navbar/navbar-desktop';
import { NavbarMobile } from '@/components/app-shells/website/navbar/navbar-mobile';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ISbStoryData } from '@storyblok/js';

type Props = {
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export const Navbar = async ({ sessions, lang, region, scope }: Props) => {
	const result = await services.storyblok.getStoryWithFallback<ISbStoryData<Layout>>(`${NEW_WEBSITE_SLUG}/layout`, lang);
	const menu = result.success ? result.data.content.menu : [];

	return (
		<>
			<div className="relative hidden lg:block">
				<NavbarDesktop menu={menu} lang={lang} region={region} scope={scope} sessions={sessions} />
			</div>
			<div className="lg:hidden">
				<NavbarMobile lang={lang} scope={scope} sessions={sessions} />
			</div>
		</>
	);
};
