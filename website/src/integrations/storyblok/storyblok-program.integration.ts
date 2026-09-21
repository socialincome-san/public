import type { Program } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { STORYBLOK_PROGRAMS_FOLDER } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import { getStoryblokContentClient } from './storyblok-content.integration';

export const fetchStoryblokPrograms = async (
	language: string,
	version: ISbStoriesParams['version'] = 'published',
): Promise<ServiceResult<ISbStoryData<Program>[]>> => {
	try {
		const params: ISbStoriesParams = {
			language,
			version,
			starts_with: `${STORYBLOK_PROGRAMS_FOLDER}/`,
		};
		const stories = await getStoryblokContentClient().getAll('cdn/stories', params);
		let programs = stories.filter(isProgramStory);
		if (programs.length === 0 && process.env.NODE_ENV !== 'production' && version === 'published') {
			const draftStories = await getStoryblokContentClient().getAll('cdn/stories', {
				...params,
				version: 'draft',
			});
			programs = draftStories.filter(isProgramStory);
		}

		return resultOk(programs);
	} catch (error) {
		console.error('Could not fetch Storyblok programs', { language, error });

		return resultFail('Could not fetch Storyblok programs');
	}
};

const isProgramStory = (story: unknown): story is ISbStoryData<Program> => {
	if (!story || typeof story !== 'object' || !('content' in story)) {
		return false;
	}
	const content = story.content;
	if (!content || typeof content !== 'object' || !('component' in content)) {
		return false;
	}

	return typeof content.component === 'string' && content.component.toLowerCase() === 'program';
};
