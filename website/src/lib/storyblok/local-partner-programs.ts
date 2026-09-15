import type { ProgramStory } from '@/components/storyblok/program/program.types';
import {
	getProgramPortalSlug,
	getProgramStoryblokSlug,
	getProgramTitle,
} from '@/components/storyblok/program/program.utils';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { LOCAL_PARTNER_PROGRAM_ROWS, selectLocalPartnerProgramStories } from './local-partner-programs.utils';

export type LocalPartnerProgramSummary = {
	programId: string;
	title: string;
	/** Slug of the Storyblok story, used for the link to the program page. */
	storyblokSlug: string;
	recipientsCount: number;
	/** True while the program's default campaign is still open. */
	isFundraising: boolean;
};

export type LocalPartnerPrograms = {
	/** Only the programs the card can render; the rest are covered by programCount. */
	programs: LocalPartnerProgramSummary[];
	programCount: number;
	recipientsTotal: number;
	/** False when the country fallback was used, so the card does not present the total as the partner's own. */
	isPartnerScoped: boolean;
};

const EMPTY: LocalPartnerPrograms = { programs: [], programCount: 0, recipientsTotal: 0, isPartnerScoped: false };

/**
 * Programs a local partner runs, with the partner's own recipient count per program.
 *
 * The link is `Recipient.localPartnerId` x `Recipient.programId`: every recipient belongs to a partner and may
 * belong to a program, so grouping a partner's recipients by program yields both the program set and the
 * partner-scoped counts.
 *
 * PROTOTYPE FALLBACK: no local partner page is linked to recipients in the seed yet, so a partner without
 * enrolled recipients falls back to the programs running in its country, counted platform-wide. That case reports
 * `isPartnerScoped: false` so the card can avoid quoting a total the partner does not own. Remove the fallback
 * once partners are linked; the primary path above needs no change.
 */
export const getLocalPartnerProgramSummaries = async (
	lang: WebsiteLanguage,
	localPartnerPortalSlug: string,
	countryIsoCode: string,
): Promise<LocalPartnerPrograms> => {
	const programsResult = await services.storyblok.getPrograms(lang);
	if (!programsResult.success) {
		return EMPTY;
	}

	const stories = programsResult.data.filter((story) => getProgramPortalSlug(story.content)) as ProgramStory[];
	const portalSlugs = [...new Set(stories.map((story) => getProgramPortalSlug(story.content)))];
	const [countsResult, filterDataResult, statsResult] = await Promise.all([
		services.read.localPartner.getProgramRecipientCountsByLocalPartnerSlug(localPartnerPortalSlug),
		services.read.program.getPublicProgramFilterDataByPortalSlugs(portalSlugs),
		services.read.program.getPublicProgramStatsByProgramPortalSlugs(portalSlugs),
	]);
	const recipientsCountByProgramId = countsResult.success ? countsResult.data : {};
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	const { stories: selectedStories, isPartnerScoped } = selectLocalPartnerProgramStories(
		stories,
		filterDataByPortalSlug,
		recipientsCountByProgramId,
		countryIsoCode,
	);

	const countedStories = selectedStories
		.map((story) => {
			const portalSlug = getProgramPortalSlug(story.content);
			const programId = filterDataByPortalSlug[portalSlug]?.programId;

			return {
				story,
				portalSlug,
				programId,
				recipientsCount:
					(programId ? recipientsCountByProgramId[programId] : undefined) ??
					statsByPortalSlug[portalSlug]?.recipientsCount ??
					0,
			};
		})
		.sort((a, b) => b.recipientsCount - a.recipientsCount);

	// Campaigns are only resolved for the programs the card actually shows.
	const programs = await Promise.all(
		countedStories.slice(0, LOCAL_PARTNER_PROGRAM_ROWS).map(async (entry) => {
			const campaignResult = entry.programId
				? await services.read.campaign.getDefaultCampaignForProgram(entry.programId)
				: null;

			return {
				programId: entry.programId ?? entry.portalSlug,
				title: getProgramTitle(entry.story.content),
				storyblokSlug: getProgramStoryblokSlug(entry.story),
				recipientsCount: entry.recipientsCount,
				isFundraising: campaignResult?.success ? campaignResult.data.endDate.getTime() > Date.now() : false,
			};
		}),
	);

	return {
		programs,
		programCount: countedStories.length,
		recipientsTotal: countedStories.reduce((total, entry) => total + entry.recipientsCount, 0),
		isPartnerScoped,
	};
};
