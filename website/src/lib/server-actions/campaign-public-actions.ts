'use server';

import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { getFocusTitleBySlug } from '@/components/storyblok/program/programs-overview.server';
import { allWebsiteLanguages, defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail } from '@/lib/services/core/service-result';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { services } from '@/lib/services/services';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';

const PROGRAM_DETAILS_IMAGE_WIDTH = 248;
const PROGRAM_DETAILS_IMAGE_HEIGHT = 140;

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.includes(value as WebsiteLanguage);

export const getPublicCampaignTitleAction = async (campaignId: string) => {
	if (typeof campaignId !== 'string') {
		return resultFail('Invalid campaign id');
	}

	const normalizedCampaignId = campaignId.trim();
	if (!normalizedCampaignId) {
		return resultFail('Missing campaign id');
	}

	return services.read.campaign.getPublicTitleById(normalizedCampaignId);
};

export const getEligiblePublicSubmissionProgramsAction = async (
	lang: WebsiteLanguage = defaultLanguage,
): Promise<
	{ success: true; data: PublicSubmissionProgramOption[] } | { success: false; error: string; status?: number }
> => {
	const language = isWebsiteLanguage(lang) ? lang : defaultLanguage;

	const [programsResult, focusesResult] = await Promise.all([
		services.storyblok.getPrograms(language),
		services.storyblok.getFocuses(language),
	]);

	const storyblokPrograms = programsResult.success ? programsResult.data : [];
	const publishedPortalSlugs = [
		...new Set(storyblokPrograms.map((program) => getProgramPortalSlug(program.content)).filter(Boolean)),
	];
	const storyblokByPortalSlug = new Map(
		storyblokPrograms.flatMap((program) => {
			const portalSlug = getProgramPortalSlug(program.content);
			if (!portalSlug) {
				return [];
			}

			return [[portalSlug, program] as const];
		}),
	);
	const focusTitleBySlug = focusesResult.success ? getFocusTitleBySlug(focusesResult.data) : new Map<string, string>();

	const eligibleResult = await services.programPublicSubmission.getEligibleProgramOptions(publishedPortalSlugs);
	if (!eligibleResult.success) {
		return eligibleResult;
	}

	return {
		...eligibleResult,
		data: eligibleResult.data.map((program): PublicSubmissionProgramOption => {
			const storyblokProgram = storyblokByPortalSlug.get(program.slug);
			const name = storyblokProgram ? getProgramTitle(storyblokProgram.content) : program.name;
			const trimmedDescription = storyblokProgram?.content.description?.trim();
			const description = trimmedDescription !== undefined && trimmedDescription.length > 0 ? trimmedDescription : null;
			const primaryImage = storyblokProgram?.content.primaryImage;
			const imageUrl = primaryImage?.filename
				? formatStoryblokUrl(
						primaryImage.filename,
						PROGRAM_DETAILS_IMAGE_WIDTH,
						PROGRAM_DETAILS_IMAGE_HEIGHT,
						primaryImage.focus,
					)
				: null;
			const tags = program.focuses.map((focus) => focusTitleBySlug.get(focus.slug) ?? focus.name);

			return {
				id: program.id,
				name,
				slug: program.slug,
				countryId: program.countryId,
				countryIsoCode: program.countryIsoCode,
				recipientsCount: program.recipientsCount,
				description,
				imageUrl,
				tags,
			};
		}),
	};
};
