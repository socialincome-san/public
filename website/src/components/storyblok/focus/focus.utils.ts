import type { Focus } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import type { FocusStory } from './focus.types';

export const isFocusStory = (value: unknown): value is FocusStory => {
	if (!value || typeof value !== 'object' || !('content' in value)) {
		return false;
	}

	const story = value as ISbStoryData<Focus>;
	if (!story.uuid || typeof story.uuid !== 'string') {
		return false;
	}
	if (!story.content || typeof story.content !== 'object') {
		return false;
	}

	return story.content.component?.toLowerCase() === 'focus';
};

const getFocusContentSlug = (focus: Focus) => focus.portalSlug.trim();

export const getFocusSlug = (focus: FocusStory) => {
	const fullSlugTail = focus.full_slug?.split('/').at(-1);

	return fullSlugTail ?? focus.slug;
};

export const getFocusTitle = (focus: Focus) => {
	const title = focus.title.trim();
	const slug = getFocusContentSlug(focus);

	return title || slug;
};
