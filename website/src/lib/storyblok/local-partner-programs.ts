import type { ProgramStory } from '@/components/storyblok/program/program.types';
import {
	getProgramPortalSlug,
	getProgramStoryblokSlug,
	getProgramTitle,
} from '@/components/storyblok/program/program.utils';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getDefaultCampaignForProgram } from '@/modules/campaigns/campaign.service';
import { getProgramRecipientCountsByLocalPartnerSlug } from '@/modules/local-partners/local-partner.service';
import {
	getPublicProgramFilterDataByPortalSlugs,
	getPublicProgramStatsByProgramPortalSlugs,
} from '@/modules/programs/program.service';
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

const DEVELOPMENT_PROGRAM_DATA_BY_PORTAL_SLUG: Record<
	string,
	{ programId: string; countryIsoCode: string; recipientsCount: number }
> = {
	'sierra-leone-core-program': { programId: 'program-si-core-sl', countryIsoCode: 'SL', recipientsCount: 9 },
	'financial-skills-for-women': {
		programId: 'program-si-women-support-sl',
		countryIsoCode: 'SL',
		recipientsCount: 9,
	},
	'skills-program': { programId: 'program-si-education-sl', countryIsoCode: 'SL', recipientsCount: 9 },
	'mother-and-newborn-program': { programId: 'program-mother-and-newborn', countryIsoCode: 'SL', recipientsCount: 5 },
	'gender-based-violence-program': {
		programId: 'program-gender-based-violence',
		countryIsoCode: 'SL',
		recipientsCount: 5,
	},
	'widow-program': { programId: 'program-widow', countryIsoCode: 'SL', recipientsCount: 5 },
	'ebola-survivors-program': { programId: 'program-ebola-survivors', countryIsoCode: 'SL', recipientsCount: 5 },
	'ghana-core-program': { programId: 'program-si-livelihood-gh', countryIsoCode: 'GH', recipientsCount: 20 },
	'cacao-farmers': { programId: 'program-si-education-gh', countryIsoCode: 'GH', recipientsCount: 12 },
	'ubi-for-artists': { programId: 'program-ubi-for-artists', countryIsoCode: 'GH', recipientsCount: 8 },
	'liberia-core-program': { programId: 'program-si-resilience-lr', countryIsoCode: 'LR', recipientsCount: 9 },
	'epilepsy-forward': { programId: 'program-si-health-lr', countryIsoCode: 'LR', recipientsCount: 5 },
	craftspeople: { programId: 'program-somaha-community-lr', countryIsoCode: 'LR', recipientsCount: 5 },
	'island-income': { programId: 'program-island-income', countryIsoCode: 'LR', recipientsCount: 5 },
};

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
		getProgramRecipientCountsByLocalPartnerSlug(localPartnerPortalSlug),
		getPublicProgramFilterDataByPortalSlugs(portalSlugs),
		getPublicProgramStatsByProgramPortalSlugs(portalSlugs),
	]);
	const isDevelopment = process.env.NODE_ENV === 'development';
	const recipientsCountByProgramId = countsResult.success ? countsResult.data : {};
	const filterDataByPortalSlug = {
		...(isDevelopment ? DEVELOPMENT_PROGRAM_DATA_BY_PORTAL_SLUG : {}),
		...(filterDataResult.success ? filterDataResult.data : {}),
	};
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	// Country fallback is prototype-only: production must not invent a program list from the partner's country.
	const { stories: selectedStories, isPartnerScoped } = selectLocalPartnerProgramStories(
		stories,
		filterDataByPortalSlug,
		recipientsCountByProgramId,
		isDevelopment ? countryIsoCode : '',
	);

	const countedStories = selectedStories
		.map((story) => {
			const portalSlug = getProgramPortalSlug(story.content);
			const programId = filterDataByPortalSlug[portalSlug]?.programId;
			const partnerCount = programId !== undefined ? recipientsCountByProgramId[programId] : undefined;
			const statsCount = statsByPortalSlug[portalSlug]?.recipientsCount;
			const developmentCount = DEVELOPMENT_PROGRAM_DATA_BY_PORTAL_SLUG[portalSlug]?.recipientsCount;

			return {
				story,
				portalSlug,
				programId,
				recipientsCount: partnerCount ?? (isDevelopment ? (statsCount ?? developmentCount) : statsCount) ?? 0,
			};
		})
		.sort((a, b) => b.recipientsCount - a.recipientsCount);

	// Campaigns are only resolved for the programs the card actually shows.
	const programs = await Promise.all(
		countedStories.slice(0, LOCAL_PARTNER_PROGRAM_ROWS).map(async (entry) => {
			const campaignResult = entry.programId ? await getDefaultCampaignForProgram(entry.programId) : null;

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
		// Partner-scoped totals come from the DB so a missing Storyblok story cannot zero the hero-matching count.
		programCount: isPartnerScoped ? Object.keys(recipientsCountByProgramId).length : countedStories.length,
		recipientsTotal: isPartnerScoped
			? Object.values(recipientsCountByProgramId).reduce((total, count) => total + count, 0)
			: countedStories.reduce((total, entry) => total + entry.recipientsCount, 0),
		isPartnerScoped,
	};
};
