import type { Program } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ProgramStory } from './program.types';

export const getProgramId = (program: Program) => {
	return program.id.trim();
};

export const getProgramDescription = (program: Program) => {
	return program.description.trim();
};

export const getProgramSlug = (program: ProgramStory) => {
	const fullSlugTail = program.full_slug?.split('/').at(-1);

	return fullSlugTail ?? program.slug;
};

export const getProgramTitle = (program: Program) => {
	return program.title.trim() || getProgramId(program);
};
