import { StoryblokComponent } from '@storyblok/react';
import type { Page } from '@storyblok/types/109655/storyblok-components';

interface PageContentTypeProps {
	blok: Page;
}

export default function PageContentType({ blok }: PageContentTypeProps) {
	return blok.content?.map((currentBlok) => <StoryblokComponent blok={currentBlok} key={currentBlok._uid} />);
}
