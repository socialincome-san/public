import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { StoryblokComponent } from '@storyblok/react';

type PageContentTypeProps = {
	blok: Page;
	translator: Translator;
};

export default function PageContentType({ blok, translator }: PageContentTypeProps) {
	return blok.content?.map((currentBlock) => (
		<StoryblokComponent blok={currentBlock} key={currentBlock._uid} translator={translator} />
	));
}
