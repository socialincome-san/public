import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokComponent } from '@storyblok/react';

interface PageContentTypeProps {
	blok: Page;
}

export default function PageContentType({ blok }: PageContentTypeProps) {
	return blok.content?.map((currentBlok) => <StoryblokComponent blok={currentBlok} key={currentBlok._uid} />);
}
