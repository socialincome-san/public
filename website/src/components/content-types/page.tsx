import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { StoryblokComponent } from '@storyblok/react';

type PageContentTypeProps = {
	blok: Page;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export default function PageContentType({ blok, lang, region }: PageContentTypeProps) {
	return blok.content?.map((currentBlock) => (
		<StoryblokComponent blok={currentBlock} key={currentBlock._uid} lang={lang} region={region} />
	));
}
