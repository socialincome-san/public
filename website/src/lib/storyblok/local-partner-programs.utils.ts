import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';

/** The card renders at most this many programs; the rest are summarised by a link. */
export const LOCAL_PARTNER_PROGRAM_ROWS = 4;

/** Only the fields this selection needs, so the helper stays free of service imports. */
type ProgramFilterData = { programId: string; countryIsoCode: string };

export type LocalPartnerProgramSelection = {
	stories: ProgramStory[];
	/** False when the country fallback was used, so callers do not present the numbers as the partner's own. */
	isPartnerScoped: boolean;
};

/**
 * Programs reached through the partner's own recipients, falling back to the programs of the partner's country.
 * The fallback is chosen from the recipient data itself, not from how many stories happened to match, so a
 * partner that is linked but missing a Storyblok story keeps an honest (possibly short) list.
 */
export const selectLocalPartnerProgramStories = (
	stories: ProgramStory[],
	filterDataByPortalSlug: Record<string, ProgramFilterData>,
	recipientsCountByProgramId: Record<string, number>,
	countryIsoCode: string,
): LocalPartnerProgramSelection => {
	const isPartnerScoped = Object.keys(recipientsCountByProgramId).length > 0;

	if (isPartnerScoped) {
		return {
			stories: stories.filter((story) => {
				const programId = filterDataByPortalSlug[getProgramPortalSlug(story.content)]?.programId;

				return programId !== undefined && recipientsCountByProgramId[programId] !== undefined;
			}),
			isPartnerScoped: true,
		};
	}

	const isoCode = countryIsoCode.trim().toUpperCase();
	if (!isoCode) {
		return { stories: [], isPartnerScoped: false };
	}

	return {
		stories: stories.filter(
			(story) => filterDataByPortalSlug[getProgramPortalSlug(story.content)]?.countryIsoCode === isoCode,
		),
		isPartnerScoped: false,
	};
};
