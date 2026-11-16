import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
export {
	getProgramImages,
	getProgramPortalSlug,
	getProgramStoryblokSlug,
	getProgramTitle,
} from '@/lib/storyblok/program-story';

// Overview stories saved before the blocks field existed, in any locale or fallback, have none and use the old fields
export const getProgramsOverviewBlocks = (overview: ISbStoryData<ProgramOverview>) =>
	overview.content.content?.length ? overview.content.content : undefined;
