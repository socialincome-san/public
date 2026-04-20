import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { StoryblokComponent } from '@storyblok/react';
import type { ParsedUrlQueryInput } from 'querystring';

type PageContentTypeProps = {
	blok: Page;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: ParsedUrlQueryInput;
};

export default function PageContentType({ blok, lang, region, searchParams }: PageContentTypeProps) {
	return blok.content?.map((currentBlock) => (
		<StoryblokComponent
			blok={currentBlock}
			key={currentBlock._uid}
			lang={lang}
			region={region}
			searchParams={searchParams}
		/>
	));
}
