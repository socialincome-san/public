import type { Program } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import type { ProgramStory } from './program.types';

export const getProgramPortalSlug = (program: Program) => {
	return program.portalSlug.trim();
};

export const getProgramStoryblokSlug = (program: ProgramStory) => {
	const fullSlugTail = program.full_slug?.split('/').at(-1);

	return fullSlugTail ?? program.slug;
};

export const getProgramTitle = (program: Program) => {
	return program.title.trim() || getProgramPortalSlug(program);
};

export const getProgramImages = (program: Program): StoryblokAsset[] => {
	return [program.primaryImage, program.secondaryImage, program.tertiaryImage, program.fourthImage].filter(
		(image): image is StoryblokAsset => Boolean(image?.filename),
	);
};
