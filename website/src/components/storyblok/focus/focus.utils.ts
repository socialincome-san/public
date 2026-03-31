import type { Focus } from '@/generated/storyblok/types/109655/storyblok-components';
import type { FocusStory } from './focus.types';

export const getFocusId = (focus: Focus) => {
	return focus.id.trim();
};

export const getFocusDescription = (focus: Focus) => {
	return focus.description.trim();
};

export const getFocusSlug = (focus: FocusStory) => {
	const fullSlugTail = focus.full_slug?.split('/').at(-1);

	return fullSlugTail ?? focus.slug;
};

export const getFocusTitle = (focus: Focus) => {
	return focus.title.trim() || getFocusId(focus);
};
