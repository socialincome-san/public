import type { Program } from '@/generated/storyblok/types/109655/storyblok-components';
import { fetchStoryblokPrograms } from '@/integrations/storyblok/storyblok-program.integration';
import { defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import * as programRepository from './program.repository';
import type { PublicSubmissionProgramOption } from './program.types';

const PROGRAM_DETAILS_IMAGE_WIDTH = 248;
const PROGRAM_DETAILS_IMAGE_HEIGHT = 140;

export const getEligibleProgramsForPublicSubmission = async (
	language: WebsiteLanguage = defaultLanguage,
): Promise<ServiceResult<PublicSubmissionProgramOption[]>> => {
	const needsLocalizedEnrichment = language !== defaultLanguage;
	const [eligibilityProgramsResult, enrichmentProgramsResult] = await Promise.all([
		fetchStoryblokPrograms(defaultLanguage),
		needsLocalizedEnrichment ? fetchStoryblokPrograms(language) : Promise.resolve(null),
	]);
	if (!eligibilityProgramsResult.success) {
		return resultFail(eligibilityProgramsResult.error);
	}

	const eligibilityPrograms = eligibilityProgramsResult.data;
	const enrichmentPrograms =
		needsLocalizedEnrichment && enrichmentProgramsResult?.success ? enrichmentProgramsResult.data : eligibilityPrograms;
	const publishedPortalSlugs = normalizeSlugs(eligibilityPrograms.map(({ content }) => getPortalSlug(content)));
	const storiesByPortalSlug = new Map(
		enrichmentPrograms.flatMap((program) => {
			const portalSlug = getPortalSlug(program.content);

			return portalSlug ? [[portalSlug, program] as const] : [];
		}),
	);

	try {
		const programs = await programRepository.findEligiblePublicSubmissionPrograms(publishedPortalSlugs);

		return resultOk(
			programs.map((program) => {
				const story = storiesByPortalSlug.get(program.slug);
				const trimmedDescription = story?.content.description?.trim();
				const description = trimmedDescription !== undefined && trimmedDescription.length > 0 ? trimmedDescription : null;
				const primaryImage = story?.content.primaryImage;

				return {
					id: program.id,
					name: story ? getProgramTitle(story.content) : program.name,
					slug: program.slug,
					countryId: program.countryId,
					countryIsoCode: program.country.isoCode,
					recipientsCount: program._count.recipients,
					description,
					imageUrl: primaryImage?.filename
						? formatStoryblokUrl(
								primaryImage.filename,
								PROGRAM_DETAILS_IMAGE_WIDTH,
								PROGRAM_DETAILS_IMAGE_HEIGHT,
								primaryImage.focus,
							)
						: null,
					tags: program.targetFocuses.map(({ focus }) => focus.name),
				};
			}),
		);
	} catch (error) {
		console.error('Could not load programs for public submission', { error });

		return resultFail('Could not load programs.');
	}
};

export const isProgramEligibleForPublicSubmission = async (programId: string): Promise<ServiceResult<boolean>> => {
	const programsResult = await fetchStoryblokPrograms(defaultLanguage);
	if (!programsResult.success) {
		return resultFail(programsResult.error);
	}
	const slugs = normalizeSlugs(programsResult.data.map(({ content }) => getPortalSlug(content)));
	if (!programId.trim() || slugs.length === 0) {
		return resultOk(false);
	}

	try {
		const program = await programRepository.findEligiblePublicSubmissionProgram(programId.trim(), slugs);

		return resultOk(Boolean(program));
	} catch (error) {
		console.error('Could not verify program eligibility', { programId, error });

		return resultFail('Could not verify program eligibility.');
	}
};

const normalizeSlugs = (slugs: string[]): string[] => [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];

const getPortalSlug = (program: Program): string => program.portalSlug.trim();

const getProgramTitle = (program: Program): string => program.title.trim() || getPortalSlug(program);
