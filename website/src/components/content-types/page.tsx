import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokComponent } from '@storyblok/react';

type PageContentTypeProps = {
	blok: Page;
};

export default function PageContentType({ blok }: PageContentTypeProps) {
	return blok.content?.map((currentBlock) => <StoryblokComponent blok={currentBlock} key={currentBlock._uid} />);
}
