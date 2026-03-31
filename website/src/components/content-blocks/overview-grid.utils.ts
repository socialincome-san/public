import type { ISbStoryData } from '@storyblok/js';

const getSlugTail = (story: ISbStoryData<unknown>) => {
	return story.full_slug?.split('/').at(-1);
};

const isStoryData = <T,>(value: ISbStoryData<T> | string): value is ISbStoryData<T> => {
	return typeof value !== 'string';
};

export const resolveSelectedStories = <T,>(
	selectedEntries: Array<ISbStoryData<T> | string> | undefined,
	allStories: ISbStoryData<T>[],
) => {
	if (!selectedEntries?.length) {
		return [];
	}

	return selectedEntries.flatMap((entry) => {
		if (isStoryData(entry)) {
			return [entry];
		}

		const story = allStories.find(
			(candidate) =>
				candidate.uuid === entry ||
				candidate.slug === entry ||
				candidate.full_slug === entry ||
				getSlugTail(candidate) === entry,
		);

		return story ? [story] : [];
	});
};

