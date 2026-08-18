import { HomePageRichtextButtonHeaderBlock } from '@/components/content-blocks/home-page-richtext-button-header';
import type { RichtextButtonHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import { getCurrentUser } from '@/lib/firebase/current-user';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	blok: RichtextButtonHeader;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const HomePageRichtextButtonHeaderBlockServer = async ({ blok, lang, region }: Props) => {
	const user = await getCurrentUser();

	return <HomePageRichtextButtonHeaderBlock blok={blok} lang={lang} region={region} isAuthenticated={user !== null} />;
};
