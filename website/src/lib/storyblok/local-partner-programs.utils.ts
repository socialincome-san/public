import { getProgramPortalSlug, type ProgramStory } from '@/lib/storyblok/program-story';

/** The card renders at most this many programs; the rest are summarised by a link. */
export const LOCAL_PARTNER_PROGRAM_ROWS = 4;

/** Only the fields this selection needs, so the helper stays free of service imports. */
type ProgramFilterData = { programId: string };

export type LocalPartnerProgramSelection = {
	stories: ProgramStory[];
	/** False when the partner has no recipients in any program yet. */
	isPartnerScoped: boolean;
};

/**
 * Programs reached through the partner's own recipients. A partner that is linked but missing a Storyblok story
 * keeps an honest (possibly short) list.
 */
export const selectLocalPartnerProgramStories = (
	stories: ProgramStory[],
	filterDataByPortalSlug: Record<string, ProgramFilterData>,
	recipientsCountByProgramId: Record<string, number>,
): LocalPartnerProgramSelection => ({
	stories: stories.filter((story) => {
		const programId = filterDataByPortalSlug[getProgramPortalSlug(story.content)]?.programId;

		return programId !== undefined && recipientsCountByProgramId[programId] !== undefined;
	}),
	isPartnerScoped: Object.keys(recipientsCountByProgramId).length > 0,
});
