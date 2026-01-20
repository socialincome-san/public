import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokComponent } from '@storyblok/react';

type PageContentTypeProps = {
	block: Page;
};

export default function PageContentType({ block }: PageContentTypeProps) {
	return block.content?.map((currentBlock) => <StoryblokComponent block={currentBlock} key={currentBlock._uid} />);
}
